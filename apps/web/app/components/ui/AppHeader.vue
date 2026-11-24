<script setup lang="ts">
// AppHeader: sticky top nav with logo, Catalog/Studio links, and theme toggle.
import { PhMoon, PhSun } from "@phosphor-icons/vue";
import { useTheme } from "../../composables/useTheme";

const { isDark, toggle } = useTheme();
</script>

<template>
  <header class="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-30 transition-colors">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <!-- Logo mark: violet circle with initials -->
        <span class="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white font-black text-xs shadow shrink-0">
          YT
        </span>
        <span class="font-bold text-gray-100 text-base tracking-tight group-hover:text-violet-400 transition">
          YoursTruly
        </span>
        <span class="text-xs bg-violet-950 text-violet-300 px-1.5 py-0.5 rounded border border-violet-800 font-mono hidden sm:inline">
          LingoClip
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-2">
        <NuxtLink
          to="/"
          class="text-sm text-gray-400 hover:text-white px-2 py-1.5 rounded-lg transition min-h-[36px] flex items-center"
          active-class="text-violet-400 font-medium"
        >
          Catalog
        </NuxtLink>

        <NuxtLink
          to="/studio"
          class="text-sm bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-700/50 px-3 py-1.5 rounded-lg transition font-medium min-h-[36px] flex items-center"
        >
          + Sync Studio
        </NuxtLink>

        <!-- Theme toggle: sun in dark mode (click to go light), moon in light mode (click to go dark) -->
        <button
          type="button"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          @click="toggle"
        >
          <PhSun v-if="isDark" :size="18" weight="bold" aria-hidden="true" />
          <PhMoon v-else :size="18" weight="bold" aria-hidden="true" />
        </button>
      </nav>
    </div>
  </header>
</template>
