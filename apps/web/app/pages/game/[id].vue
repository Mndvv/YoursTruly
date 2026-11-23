<script setup lang="ts">
import type { SongDetailDto } from "@yourstruly/contracts";
import GameplayContainer from "../../features/gameplay/GameplayContainer.vue";

const route = useRoute();
const config = useRuntimeConfig();
const songId = String(route.params.id);

const { data: song, error } = await useFetch<SongDetailDto>(
  `${config.public.apiBase}/api/songs/${songId}`,
);

useHead({
  title: () => (song.value ? `Play ${song.value.title} — YoursTruly` : "Play Song — YoursTruly"),
});
</script>

<template>
  <div v-if="error" class="max-w-md mx-auto py-20 text-center">
    <p class="text-red-400 mb-4">Could not load this song.</p>
    <NuxtLink to="/" class="text-indigo-400 hover:underline">Return to Catalog</NuxtLink>
  </div>
  <GameplayContainer v-else-if="song" :song="song" />
</template>
