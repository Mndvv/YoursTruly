<script setup lang="ts">
import AppButton from "../ui/AppButton.vue";

interface Props {
  songId?: string;
  isEditMode?: boolean;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-gray-900 border border-indigo-700 rounded-2xl p-6 text-center flex flex-col items-center gap-4">
    <span class="text-4xl">🎉</span>
    <h2 class="text-2xl font-bold text-white">
      {{ isEditMode ? 'Song Updated Successfully!' : 'Song Published Successfully!' }}
    </h2>
    <p class="text-gray-300 text-sm max-w-md">
      {{ isEditMode
        ? 'Your lyrics timing, word gap toggles, and video settings have been saved.'
        : 'Your secret edit token has been saved to your browser. You can edit this track at any time.' }}
    </p>
    <NuxtLink v-if="songId" :to="`/game/${songId}`">
      <AppButton size="lg" variant="primary">Play Song Now ▶</AppButton>
    </NuxtLink>
  </div>
</template>
