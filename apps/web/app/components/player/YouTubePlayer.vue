<script setup lang="ts">
import { PhLockSimple } from "@phosphor-icons/vue";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
  videoId: string;
  startMs?: number;
  endMs?: number | null;
  playbackRate?: number;
  isPaused?: boolean;
  autoplay?: boolean;
  showControls?: boolean;
  disableScrubbing?: boolean;
  isBlurred?: boolean;
}

interface YTPlayer {
  getCurrentTime?: () => number;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy?: () => void;
  setPlaybackRate?: (rate: number) => void;
  unloadModule?: (module: string) => void;
  setOption?: (module: string, option: string, value: unknown) => void;
}

const props = withDefaults(defineProps<Props>(), {
  startMs: 0,
  endMs: null,
  playbackRate: 1.0,
  isPaused: false,
  autoplay: false,
  showControls: true,
  disableScrubbing: false,
  isBlurred: false,
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
      controls: props.showControls && !props.disableScrubbing ? 1 : 0,
      disablekb: props.disableScrubbing ? 1 : 0,
      fs: 0,
      rel: 0,
      cc_load_policy: 0,
      iv_load_policy: 3,
      start: Math.floor(props.startMs / 1000),
    },
    events: {
      onReady: () => disableCaptions(),
      onStateChange: (event: { data: number }) => {
        if (event.data === 1) {
          disableCaptions();
          emit("play");
        } else if (event.data === 2) emit("pause");
        else if (event.data === 0) emit("ended");
      },
    },
  });
  animFrame = requestAnimationFrame(pollTime);
}

function disableCaptions() {
  if (!player) return;
  try {
    if (typeof player.unloadModule === "function") {
      player.unloadModule("captions");
      player.unloadModule("cc");
    }
    if (typeof player.setOption === "function") {
      player.setOption("captions", "track", {});
      player.setOption("cc", "track", {});
    }
  } catch (_) {}
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
    <div
      :id="containerId"
      class="w-full h-full transition-[filter,transform] duration-500"
      :class="{ 'blur-2xl scale-110 filter brightness-75': isBlurred }"
    />
    <div
      v-if="disableScrubbing"
      class="absolute inset-0 z-10 select-none bg-transparent cursor-default"
      @click.stop.prevent
      @mousedown.stop.prevent
      @touchstart.stop.prevent
      @pointerdown.stop.prevent
    />
    <!-- Lyric Video Ambient Censorship Overlay -->
    <div
      v-if="isBlurred"
      class="absolute inset-0 z-15 pointer-events-none flex flex-col items-center justify-center bg-black/35 backdrop-blur-sm"
    >
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-2xl">
        <PhLockSimple :size="13" weight="bold" aria-hidden="true" />
        <span>Lyric Video Blurred (Anti-Cheat)</span>
      </div>
    </div>
  </div>
</template>
