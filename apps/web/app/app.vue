<script setup lang="ts">
import AppHeader from "./components/ui/AppHeader.vue";
import { useTheme } from "./composables/useTheme";

// Initialize theme on mount — applies stored preference or system default
useTheme();
</script>

<template>
  <div
    class="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans selection:bg-violet-600 selection:text-white transition-colors duration-200"
  >
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>
  </div>
</template>
