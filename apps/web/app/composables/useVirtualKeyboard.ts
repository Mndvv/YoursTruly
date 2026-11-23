import { onBeforeUnmount, onMounted, ref } from "vue";

export function useVirtualKeyboard() {
  const isKeyboardOpen = ref(false);
  const keyboardHeight = ref(0);

  function updateViewport() {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vp = window.visualViewport;
    const diff = window.innerHeight - vp.height;
    if (diff > 120) {
      isKeyboardOpen.value = true;
      keyboardHeight.value = Math.round(diff);
    } else {
      isKeyboardOpen.value = false;
      keyboardHeight.value = 0;
    }
  }

  function dismissKeyboard() {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  onMounted(() => {
    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewport);
      window.visualViewport.addEventListener("scroll", updateViewport);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.removeEventListener("resize", updateViewport);
      window.visualViewport.removeEventListener("scroll", updateViewport);
    }
  });

  return {
    isKeyboardOpen,
    keyboardHeight,
    dismissKeyboard,
  };
}
