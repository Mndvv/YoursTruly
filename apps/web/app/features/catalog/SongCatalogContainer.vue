<script setup lang="ts">
import type { SongSummaryDto } from "@yourstruly/contracts";
import { onMounted, ref } from "vue";
import SongCard from "../../components/catalog/SongCard.vue";
import AppButton from "../../components/ui/AppButton.vue";

const config = useRuntimeConfig();
const songs = ref<SongSummaryDto[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const notice = ref<string | null>(null);
const isDeletingId = ref<string | null>(null);
const isImporting = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

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

async function exportCatalogue() {
  try {
    const res = await fetch(`${config.public.apiBase}/api/songs/export`);
    if (!res.ok) throw new Error("Failed to export catalogue");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `yourstruly-catalogue-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice("Catalogue exported successfully.");
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Export failed";
  }
}

function triggerImport() {
  fileInputRef.value?.click();
}

async function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  isImporting.value = true;
  error.value = null;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const res = await fetch(`${config.public.apiBase}/api/songs/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to import catalogue");
    }
    const result = await res.json();
    showNotice(
      `Import complete: ${result.importedCount} songs imported, ${result.skippedCount} skipped.`,
    );
    await loadSongs();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Failed to import catalogue file";
  } finally {
    isImporting.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

function showNotice(msg: string) {
  notice.value = msg;
  setTimeout(() => {
    notice.value = null;
  }, 4000);
}

async function onDeleteSong(songId: string, songTitle: string) {
  if (typeof window !== "undefined" && !window.confirm(`Delete "${songTitle}"?`)) return;

  isDeletingId.value = songId;
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(`yourstruly:editToken:${songId}`) || ""
        : "";
    const res = await fetch(`${config.public.apiBase}/api/songs/${songId}`, {
      method: "DELETE",
      headers: token ? { "x-edit-token": token } : {},
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete track");
    }

    songs.value = songs.value.filter((s) => s.id !== songId);
    if (typeof window !== "undefined") localStorage.removeItem(`yourstruly:editToken:${songId}`);
    showNotice(`Deleted "${songTitle}"`);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Failed to delete track";
  } finally {
    isDeletingId.value = null;
  }
}

onMounted(() => loadSongs());
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Song Catalog</h1>
        <p class="text-gray-400 text-xs sm:text-sm mt-1">Play and master languages with word-synced YouTube music videos.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="onFileSelected" />
        <AppButton size="sm" variant="secondary" :disabled="isLoading || songs.length === 0" @click="exportCatalogue">
          Export JSON
        </AppButton>
        <AppButton size="sm" variant="secondary" :disabled="isImporting" @click="triggerImport">
          {{ isImporting ? 'Importing...' : 'Import JSON' }}
        </AppButton>
        <NuxtLink to="/studio">
          <AppButton size="sm" variant="primary">
            + Add New Song
          </AppButton>
        </NuxtLink>
      </div>
    </div>

    <div v-if="notice" class="mb-6 p-3 bg-indigo-950/70 border border-indigo-700/80 rounded-xl text-xs sm:text-sm text-indigo-200 text-center font-medium shadow-md">
      {{ notice }}
    </div>

    <div v-if="isLoading" class="text-center py-20 text-gray-500 font-mono text-sm">
      Loading songs...
    </div>

    <div v-else-if="error" class="bg-red-950/40 border border-red-800 rounded-xl p-5 text-center text-red-300 text-sm mb-6">
      {{ error }}
    </div>

    <div v-else-if="songs.length === 0" class="text-center py-20 border border-dashed border-gray-800 rounded-2xl p-6">
      <p class="text-gray-400 mb-4 text-sm">No songs synced yet. Import an existing catalogue or add a new song!</p>
      <div class="flex flex-wrap justify-center gap-3">
        <AppButton variant="secondary" @click="triggerImport">Import Catalogue</AppButton>
        <NuxtLink to="/studio">
          <AppButton variant="primary">Open Sync Studio</AppButton>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <SongCard
        v-for="song in songs"
        :key="song.id"
        :song="song"
        :is-deleting="isDeletingId === song.id"
        @delete="onDeleteSong"
      />
    </div>
  </div>
</template>
