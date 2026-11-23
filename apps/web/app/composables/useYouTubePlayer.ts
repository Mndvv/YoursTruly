import { ref } from "vue";

export function useYouTubePlayer() {
  const currentTimeMs = ref(0);
  const isPlaying = ref(false);
  const playbackRate = ref(1.0);
  const isEnded = ref(false);

  function onTimeUpdate(timeMs: number) {
    currentTimeMs.value = timeMs;
  }

  function onPlay() {
    isPlaying.value = true;
    isEnded.value = false;
  }

  function onPause() {
    isPlaying.value = false;
  }

  function onEnded() {
    isPlaying.value = false;
    isEnded.value = true;
  }

  function setSpeed(speed: number) {
    playbackRate.value = speed;
  }

  return {
    currentTimeMs,
    isPlaying,
    playbackRate,
    isEnded,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    setSpeed,
  };
}
