<script setup lang="ts">
// Dumb UI header with navigation links
</script>

<template>
  <header class="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <span class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow">
          YT
        </span>
        <span class="font-bold text-gray-100 text-base tracking-tight group-hover:text-indigo-400 transition">
          YoursTruly
        </span>
        <span class="text-xs bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800 font-mono">
          LingoClip
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-3">
        <NuxtLink
          to="/"
          class="text-sm text-gray-400 hover:text-white px-2 py-1 rounded transition"
          active-class="text-indigo-400 font-medium"
        >
          Catalog
        </NuxtLink>
        <NuxtLink
          to="/studio"
          class="text-sm bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-700/50 px-3 py-1.5 rounded-lg transition font-medium"
        >
          + Sync Studio
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
