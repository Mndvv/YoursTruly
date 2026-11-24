<script setup lang="ts">
// StudioPublishedCard: success state shown after a song is published or updated.
import { PhCheckCircle } from "@phosphor-icons/vue";
import AppButton from "../ui/AppButton.vue";

interface Props {
  songId?: string;
  isEditMode?: boolean;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-gray-900 border border-violet-700 rounded-2xl p-6 text-center flex flex-col items-center gap-4">
    <!-- Success mark: violet checkmark circle, no emoji -->
    <div class="w-14 h-14 rounded-full bg-violet-950 border border-violet-600 flex items-center justify-center">
      <PhCheckCircle :size="32" weight="fill" class="text-violet-400" aria-hidden="true" />
    </div>
    <h2 class="text-2xl font-bold text-white">
      {{ isEditMode ? "Song Updated" : "Song Published" }}
    </h2>
    <p class="text-gray-300 text-sm max-w-md">
      {{ isEditMode
        ? "Your lyrics timing, word gap toggles, and video settings have been saved."
        : "Your secret edit token has been saved to your browser. You can edit this track at any time." }}
    </p>
    <NuxtLink v-if="songId" :to="`/game/${songId}`">
      <AppButton size="lg" variant="primary">Play Song Now</AppButton>
    </NuxtLink>
  </div>
</template>
