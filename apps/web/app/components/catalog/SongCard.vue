<script setup lang="ts">
import { PhPencilSimple, PhPlay, PhTrash } from "@phosphor-icons/vue";
// SongCard: displays song thumbnail, title, artist, play count, edit and delete actions.
import type { SongSummaryDto } from "@yourstruly/contracts";
import AppButton from "../ui/AppButton.vue";

interface Props {
  song: SongSummaryDto;
  isDeleting?: boolean;
}

defineProps<Props>();

const emit = defineEmits<(e: "delete", id: string, title: string) => void>();
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-violet-600/50 transition group flex flex-col">
    <div class="relative aspect-video bg-black">
      <img
        :src="`https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`"
        :alt="song.title"
        class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        loading="lazy"
        width="480"
        height="360"
      />
      <!-- Language badge: functional label for quick scanning -->
      <span class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white border border-gray-700">
        {{ song.languageCode.toUpperCase() }}
      </span>
    </div>

    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-white group-hover:text-violet-400 transition line-clamp-1">
          {{ song.title }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-400 line-clamp-1 mb-3">{{ song.artist }}</p>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-gray-800/80">
        <!-- Play count: data display, monospace for alignment -->
        <span class="text-xs text-gray-500 font-mono flex items-center gap-1">
          <PhPlay :size="12" weight="fill" aria-hidden="true" />
          {{ song.playCount }}
        </span>
        <div class="flex items-center gap-1.5">
          <NuxtLink :to="`/studio?id=${song.id}`">
            <button
              type="button"
              title="Edit in Sync Studio"
              aria-label="Edit in Sync Studio"
              class="text-xs text-violet-400 hover:text-violet-300 px-2 py-1.5 rounded-lg hover:bg-violet-950/40 transition min-h-[36px] flex items-center gap-1"
            >
              <PhPencilSimple :size="14" weight="bold" aria-hidden="true" />
              Edit
            </button>
          </NuxtLink>
          <button
            type="button"
            :disabled="isDeleting"
            :aria-label="`Delete ${song.title}`"
            title="Delete track"
            class="text-xs text-gray-400 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-950/40 transition disabled:opacity-50 min-h-[36px] flex items-center gap-1"
            @click.stop="emit('delete', song.id, song.title)"
          >
            <PhTrash :size="14" weight="bold" aria-hidden="true" />
            {{ isDeleting ? "Deleting..." : "Delete" }}
          </button>
          <NuxtLink :to="`/game/${song.id}`">
            <AppButton size="sm" variant="primary">Play</AppButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
