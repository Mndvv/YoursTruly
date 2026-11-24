import { computed, onMounted, ref } from "vue";

const STORAGE_KEY = "yt-theme";

// Module-level reactive state shared across all useTheme() calls
const isDark = ref(true);

function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  if (dark) {
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.add("light");
  }
  isDark.value = dark;
}

function resolveInitialTheme(): boolean {
  if (typeof localStorage === "undefined" || typeof window === "undefined") return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light") return false;
  if (stored === "dark") return true;
  // No preference stored: use system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  onMounted(() => {
    const dark = resolveInitialTheme();
    applyTheme(dark);
  });

  function toggle() {
    const next = !isDark.value;
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage unavailable in some privacy browsers
    }
  }

  return {
    isDark: computed(() => isDark.value),
    toggle,
  };
}
