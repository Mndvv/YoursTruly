<script setup lang="ts">
import type { SongSummaryDto } from "@yourstruly/contracts";
import { onMounted, ref } from "vue";
import AppButton from "../../components/ui/AppButton.vue";

const config = useRuntimeConfig();
const songs = ref<SongSummaryDto[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

async function loadSongs() {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${config.public.apiBase}/api/songs`);
    if (!res.ok) throw new Error("Failed to load catalog");
    songs.value = await res.json();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Error loading songs";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => loadSongs());
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-white tracking-tight">Song Catalog</h1>
        <p class="text-gray-400 text-sm mt-1">Play and master languages with word-synced YouTube music videos.</p>
      </div>

      <NuxtLink to="/studio">
        <AppButton size="md" variant="primary">
          + Add New Song
        </AppButton>
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center py-20 text-gray-500 font-mono">
      Loading songs...
    </div>

    <div v-else-if="error" class="bg-red-950/40 border border-red-800 rounded-xl p-6 text-center text-red-300">
      {{ error }}
    </div>

    <div v-else-if="songs.length === 0" class="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
      <p class="text-gray-400 mb-4">No songs synced yet. Be the first to add one!</p>
      <NuxtLink to="/studio">
        <AppButton variant="primary">Open Sync Studio</AppButton>
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="song in songs"
        :key="song.id"
        class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-600/50 transition group flex flex-col"
      >
        <div class="relative aspect-video bg-black">
          <img
            :src="`https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`"
            :alt="song.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white border border-gray-700">
            {{ song.languageCode.toUpperCase() }}
          </span>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h2 class="text-lg font-bold text-white group-hover:text-indigo-400 transition line-clamp-1">
              {{ song.title }}
            </h2>
            <p class="text-sm text-gray-400 line-clamp-1 mb-3">{{ song.artist }}</p>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-gray-800/80">
            <span class="text-xs text-gray-500 font-mono">▶ {{ song.playCount }} plays</span>
            <NuxtLink :to="`/game/${song.id}`">
              <AppButton size="sm" variant="primary">Play</AppButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
