<script setup lang="ts">
import type { YouTubeSearchResultDto } from "@yourstruly/contracts";
import { ref } from "vue";
import AppButton from "../ui/AppButton.vue";

interface Props {
  apiBase: string;
  initialUrl?: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialUrl: "",
  isLoading: false,
});

const emit = defineEmits<(e: "select", urlOrId: string) => void>();

const mode = ref<"search" | "url">("search");
const searchQuery = ref("");
const isSearching = ref(false);
const searchResults = ref<YouTubeSearchResultDto[]>([]);
const searchError = ref<string | null>(null);
const directUrl = ref(props.initialUrl);

async function handleSearch() {
  const query = searchQuery.value.trim();
  if (!query) return;

  isSearching.value = true;
  searchError.value = null;
  try {
    const res = await fetch(`${props.apiBase}/api/youtube/search?q=${encodeURIComponent(query)}`);
    if (!res.ok)
      throw new Error("Could not find YouTube videos. Please try again or paste direct link.");
    searchResults.value = await res.json();
  } catch (err: unknown) {
    searchError.value = err instanceof Error ? err.message : "Search failed";
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

function selectResult(videoId: string) {
  emit("select", videoId);
}

function handleDirectSubmit() {
  if (directUrl.value.trim()) {
    emit("select", directUrl.value.trim());
  }
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-white">1. Select YouTube Music Video</h2>
        <p class="text-xs text-gray-400">Search by title/artist or paste an existing YouTube link.</p>
      </div>

      <div class="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          :class="[mode === 'search' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white']"
          @click="mode = 'search'"
        >
          Search YouTube
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          :class="[mode === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white']"
          @click="mode = 'url'"
        >
          Paste Link / ID
        </button>
      </div>
    </div>

    <!-- Search Mode -->
    <div v-if="mode === 'search'" class="flex flex-col gap-3">
      <form class="flex flex-col sm:flex-row gap-2" @submit.prevent="handleSearch">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search song title or artist (e.g. Porter Robinson Everything Goes On)"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
        />
        <AppButton
          type="submit"
          variant="primary"
          class="min-h-[44px] px-5"
          :disabled="isSearching || !searchQuery.trim()"
        >
          {{ isSearching ? 'Searching...' : 'Search' }}
        </AppButton>
      </form>

      <div v-if="searchError" class="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
        {{ searchError }}
      </div>

      <!-- Search Results Grid -->
      <div v-if="searchResults.length > 0" class="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        <div
          v-for="v in searchResults"
          :key="v.id"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-950 border border-gray-800 hover:border-indigo-600/60 rounded-xl transition cursor-pointer group"
          @click="selectResult(v.id)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative w-28 h-16 sm:w-32 sm:h-20 bg-black rounded-lg overflow-hidden shrink-0">
              <img
                :src="v.thumbnailUrl"
                :alt="v.title"
                class="w-full h-full object-cover group-hover:scale-105 transition"
                loading="lazy"
              />
              <span
                v-if="v.duration"
                class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/85 text-white"
              >
                {{ v.duration }}
              </span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-400 transition line-clamp-2">
                {{ v.title }}
              </div>
              <div class="text-[11px] text-gray-400 truncate mt-0.5">{{ v.channel }}</div>
            </div>
          </div>

          <AppButton
            size="sm"
            variant="primary"
            class="shrink-0 self-end sm:self-center min-h-[40px] px-3.5"
            :disabled="isLoading"
            @click.stop="selectResult(v.id)"
          >
            Select
          </AppButton>
        </div>
      </div>

      <div v-else-if="!isSearching" class="text-center py-8 border border-dashed border-gray-800 rounded-xl text-gray-500 text-xs">
        Enter song title or artist above to search YouTube music videos directly.
      </div>
    </div>

    <!-- Direct Paste Mode -->
    <div v-else class="flex flex-col gap-3">
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="directUrl"
          type="text"
          placeholder="Paste YouTube Video URL or ID (e.g. https://www.youtube.com/watch?v=...)"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
          @keydown.enter.prevent="handleDirectSubmit"
        />
        <AppButton
          variant="primary"
          class="min-h-[44px] px-5"
          :disabled="isLoading || !directUrl.trim()"
          @click="handleDirectSubmit"
        >
          {{ isLoading ? 'Loading...' : 'Load Video' }}
        </AppButton>
      </div>
      <p class="text-[11px] text-gray-500">Supports full YouTube watch URLs, youtu.be short links, or raw 11-character video IDs.</p>
    </div>
  </div>
</template>
