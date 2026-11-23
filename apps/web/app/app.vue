<script setup lang="ts">
import AppHeader from "./components/ui/AppHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
    <AppHeader />
    <main class="flex-1 pb-16">
      <NuxtPage />
    </main>
  </div>
</template>
