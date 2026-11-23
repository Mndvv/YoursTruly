<script setup lang="ts">
import SongCatalogContainer from "../features/catalog/SongCatalogContainer.vue";

useHead({
  title: "YoursTruly — Song Catalog",
  meta: [
    {
      name: "description",
      content: "Word-level lyric synchronized music video language learning catalog.",
    },
  ],
});
</script>

<template>
  <SongCatalogContainer />
</template>
