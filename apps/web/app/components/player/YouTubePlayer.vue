<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
  videoId: string;
  startMs?: number;
  endMs?: number | null;
  playbackRate?: number;
  isPaused?: boolean;
  autoplay?: boolean;
}

interface YTPlayer {
  getCurrentTime?: () => number;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy?: () => void;
  setPlaybackRate?: (rate: number) => void;
}

const props = withDefaults(defineProps<Props>(), {
  startMs: 0,
  endMs: null,
  playbackRate: 1.0,
  isPaused: false,
  autoplay: false,
});

const emit = defineEmits<{
  (e: "timeupdate", timeMs: number): void;
  (e: "play"): void;
  (e: "pause"): void;
  (e: "ended"): void;
}>();

const containerId = `yt_player_${Math.random().toString(36).substring(2, 9)}`;
let player: YTPlayer | null = null;
let animFrame: number | null = null;

function pollTime() {
  if (player && typeof player.getCurrentTime === "function") {
    const currentMs = Math.round(player.getCurrentTime() * 1000);
    emit("timeupdate", currentMs);

    if (props.endMs && currentMs >= props.endMs) {
      if (typeof player.pauseVideo === "function") player.pauseVideo();
      emit("ended");
    }
  }
  animFrame = requestAnimationFrame(pollTime);
}

function initPlayer() {
  const win = window as unknown as Record<string, unknown>;
  const yt = win.YT as Record<string, unknown> | undefined;

  if (!yt || !yt.Player) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    win.onYouTubeIframeAPIReady = () => createPlayerInstance();
  } else {
    createPlayerInstance();
  }
}

function createPlayerInstance() {
  const win = window as unknown as Record<string, unknown>;
  const YT = win.YT as { Player: new (id: string, opts: unknown) => YTPlayer };
  if (!YT || !YT.Player) return;

  player = new YT.Player(containerId, {
    videoId: props.videoId,
    playerVars: {
      autoplay: props.autoplay ? 1 : 0,
      controls: 1,
      rel: 0,
      start: Math.floor(props.startMs / 1000),
    },
    events: {
      onStateChange: (event: { data: number }) => {
        if (event.data === 1) emit("play");
        else if (event.data === 2) emit("pause");
        else if (event.data === 0) emit("ended");
      },
    },
  });
  animFrame = requestAnimationFrame(pollTime);
}

function pause() {
  if (player && typeof player.pauseVideo === "function") player.pauseVideo();
}

function play() {
  if (player && typeof player.playVideo === "function") player.playVideo();
}

function seekTo(seconds: number) {
  if (player && typeof player.seekTo === "function") player.seekTo(seconds, true);
}

defineExpose({
  pause,
  play,
  seekTo,
});

watch(
  () => props.isPaused,
  (paused) => {
    if (paused) pause();
    else play();
  },
);

watch(
  () => props.playbackRate,
  (rate) => {
    if (player && typeof player.setPlaybackRate === "function") player.setPlaybackRate(rate);
  },
);

onMounted(() => initPlayer());
onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (player && typeof player.destroy === "function") player.destroy();
});
</script>

<template>
  <div class="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-gray-800">
    <div :id="containerId" class="w-full h-full" />
  </div>
</template>
