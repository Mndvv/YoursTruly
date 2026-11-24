export interface YouTubePlayerProps {
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

export interface YTPlayerInstance {
  getCurrentTime?: () => number;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy?: () => void;
  setPlaybackRate?: (rate: number) => void;
  unMute?: () => void;
  unloadModule?: (module: string) => void;
  setOption?: (module: string, option: string, value: unknown) => void;
}

export function isLocalNetworkIp(hostname: string): boolean {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

export function buildPlayerVars(props: YouTubePlayerProps, origin?: string) {
  return {
    autoplay: props.autoplay ? 1 : 0,
    controls: props.showControls && !props.disableScrubbing ? 1 : 0,
    disablekb: props.disableScrubbing ? 1 : 0,
    fs: 0,
    rel: 0,
    cc_load_policy: 0,
    iv_load_policy: 3,
    start: Math.floor(props.startMs / 1000),
    playsinline: 1,
    enablejsapi: 1,
    origin,
    widget_referrer: origin,
  };
}
