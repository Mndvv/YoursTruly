<script setup lang="ts">
import { PhLockSimple } from "@phosphor-icons/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import YouTubeErrorOverlay from "./YouTubeErrorOverlay.vue";
import YouTubeTapToPlayOverlay from "./YouTubeTapToPlayOverlay.vue";
import {
  type YTPlayerInstance,
  type YouTubePlayerProps,
  buildPlayerVars,
  isLocalNetworkIp,
} from "./youtubePlayerTypes";

const props = withDefaults(defineProps<YouTubePlayerProps>(), {
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
  (e: "error", code: number): void;
}>();

const containerId = `yt_player_${Math.random().toString(36).substring(2, 9)}`;
const embedErrorCode = ref<number | null>(null);
const isAutoplayBlocked = ref(false);
const isPlaying = ref(false);
let player: YTPlayerInstance | null = null;
let animFrame: number | null = null;

const isLocalIp = computed(() =>
  typeof window !== "undefined" ? isLocalNetworkIp(window.location.hostname) : false,
);

function pollTime() {
  if (player?.getCurrentTime) {
    const currentMs = Math.round(player.getCurrentTime() * 1000);
    emit("timeupdate", currentMs);
    if (props.endMs && currentMs >= props.endMs) {
      player.pauseVideo?.();
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
  const YT = win.YT as { Player: new (id: string, opts: unknown) => YTPlayerInstance };
  if (!YT || !YT.Player) return;

  const origin = isLocalIp.value ? undefined : window.location.origin;
  embedErrorCode.value = null;
  isAutoplayBlocked.value = false;

  player = new YT.Player(containerId, {
    width: "100%",
    height: "100%",
    videoId: props.videoId,
    playerVars: buildPlayerVars(props, origin),
    events: {
      onReady: () => disableCaptions(),
      onAutoplayBlocked: () => {
        isAutoplayBlocked.value = true;
      },
      onStateChange: (event: { data: number }) => {
        if (event.data === 1) {
          isPlaying.value = true;
          isAutoplayBlocked.value = false;
          disableCaptions();
          emit("play");
        } else if (event.data === 2) {
          isPlaying.value = false;
          emit("pause");
        } else if (event.data === 0) {
          isPlaying.value = false;
          emit("ended");
        }
      },
      onError: (event: { data: number }) => {
        embedErrorCode.value = event.data;
        emit("error", event.data);
      },
    },
  });
  animFrame = requestAnimationFrame(pollTime);
}

function handleUserStart() {
  isAutoplayBlocked.value = false;
  embedErrorCode.value = null;
  player?.unMute?.();
  player?.playVideo?.();
}

function disableCaptions() {
  player?.unloadModule?.("captions");
  player?.unloadModule?.("cc");
  player?.setOption?.("captions", "track", {});
  player?.setOption?.("cc", "track", {});
}

defineExpose({
  pause: () => player?.pauseVideo?.(),
  play: () => player?.playVideo?.(),
  seekTo: (s: number) => player?.seekTo?.(s, true),
});

watch(
  () => props.isPaused,
  (p) => (p ? player?.pauseVideo?.() : player?.playVideo?.()),
);
watch(
  () => props.playbackRate,
  (r) => player?.setPlaybackRate?.(r),
);
watch(
  () => props.videoId,
  () => createPlayerInstance(),
);

onMounted(() => initPlayer());
onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame);
  player?.destroy?.();
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
      v-if="disableScrubbing && isPlaying && !embedErrorCode && !isAutoplayBlocked"
      class="absolute inset-0 z-10 select-none bg-transparent cursor-default"
      @click.stop.prevent
      @mousedown.stop.prevent
      @touchstart.stop.prevent
      @pointerdown.stop.prevent
    />
    <div
      v-if="isBlurred && !embedErrorCode"
      class="absolute top-2 right-2 z-15 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 border border-amber-500/40 text-amber-300 text-[10px] font-medium backdrop-blur-sm shadow select-none"
    >
      <PhLockSimple :size="11" weight="bold" aria-hidden="true" />
      <span>Blurred</span>
    </div>

    <YouTubeTapToPlayOverlay
      :is-visible="isAutoplayBlocked && !embedErrorCode"
      @play="handleUserStart"
    />
    <YouTubeErrorOverlay
      :error-code="embedErrorCode"
      :video-id="videoId"
      :is-local-ip="isLocalIp"
      @retry="handleUserStart"
    />
  </div>
</template>

<style scoped>
:deep(iframe) {
  width: 100% !important;
  height: 100% !important;
}
</style>
