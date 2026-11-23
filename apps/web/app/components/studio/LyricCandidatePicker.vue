<script setup lang="ts">
import type { LyricaCandidateDto } from "@yourstruly/contracts";
import { ref } from "vue";
import AppButton from "../ui/AppButton.vue";

interface Props {
  candidates: LyricaCandidateDto[];
  isSearching: boolean;
  initialKeyword?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialKeyword: "",
});

const emit = defineEmits<{
  (e: "search", keyword: string): void;
  (e: "select", candidate: LyricaCandidateDto): void;
  (e: "applyCustom", lyrics: string): void;
}>();

const keywordInput = ref(props.initialKeyword);
const isCustomOpen = ref(false);
const customInput = ref("");

function handleSearch() {
  emit("search", keywordInput.value);
}

function handleApplyCustom() {
  emit("applyCustom", customInput.value);
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-white">2. Select Lyrics Version</h2>
      <span class="text-xs text-gray-400">Powered by Lyrica</span>
    </div>

    <div class="flex flex-col sm:flex-row gap-2">
      <input
        v-model="keywordInput"
        type="text"
        placeholder="Search by keywords, song title, or artist..."
        class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white"
        @keydown.enter="handleSearch"
      />
      <AppButton :disabled="isSearching" @click="handleSearch">
        {{ isSearching ? "Searching..." : "Search Versions" }}
      </AppButton>
    </div>

    <div v-if="isSearching" class="py-8 text-center text-gray-400 font-mono text-sm">
      Searching Lyrica across available providers...
    </div>

    <div v-else-if="candidates.length > 0" class="flex flex-col gap-3 mt-2">
      <div
        v-for="candidate in candidates"
        :key="candidate.id"
        class="p-4 rounded-xl border border-gray-800 bg-gray-850 hover:border-indigo-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-white">{{ candidate.title }}</span>
            <span class="text-gray-400 text-sm">by {{ candidate.artist }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
              {{ candidate.source }} ({{ candidate.syncLevel }}-sync)
            </span>
          </div>
          <p class="text-xs text-gray-400 italic line-clamp-2">{{ candidate.sampleText }}</p>
        </div>

        <AppButton size="sm" variant="primary" @click="emit('select', candidate)">
          Select this version
        </AppButton>
      </div>
    </div>

    <div v-else class="py-6 text-center text-gray-500 text-sm">
      No lyric versions found for this query. Try adjusting the search keywords above!
    </div>

    <div class="pt-3 border-t border-gray-800">
      <button
        type="button"
        class="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
        @click="isCustomOpen = !isCustomOpen"
      >
        {{ isCustomOpen ? "▲ Hide Custom / Manual Input" : "✍️ Or Paste Custom / LRC Lyrics Manually" }}
      </button>

      <div v-if="isCustomOpen" class="mt-3 flex flex-col gap-2">
        <textarea
          v-model="customInput"
          rows="5"
          placeholder="Paste plain lyrics or LRC format (e.g. [00:16.10] Don't try to make yourself remember...)"
          class="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs font-mono text-white placeholder-gray-500"
        />
        <AppButton size="sm" variant="secondary" @click="handleApplyCustom">
          Load Custom Lyrics
        </AppButton>
      </div>
    </div>
  </div>
</template>
