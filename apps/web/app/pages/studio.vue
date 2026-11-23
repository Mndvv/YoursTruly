<script setup lang="ts">
import SyncStudioContainer from "../features/studio/SyncStudioContainer.vue";

useHead({
  title: "YoursTruly — Authoring & Word Sync Studio",
  meta: [
    {
      name: "description",
      content: "Synchronize word-level timestamps with YouTube music videos.",
    },
  ],
});
</script>

<template>
  <SyncStudioContainer />
</template>
