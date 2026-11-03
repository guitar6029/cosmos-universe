import { computed, ref } from "vue";
import { UNIVERSE_MEDIA } from "../data/universeMedia";

const DEFAULT_VOLUME = 0.65;
const audio = ref<HTMLAudioElement>();
const volume = ref(DEFAULT_VOLUME);
const muted = ref(false);
const playbackState = ref<"idle" | "loading" | "playing" | "paused" | "error">("idle");
const errorMessage = ref("");
let playbackRequest = 0;
let playbackExpected = false;

function ensureAudio() {
  if (audio.value || typeof Audio === "undefined") return audio.value;

  const player = new Audio(UNIVERSE_MEDIA.interplanetaryLounge);
  player.loop = true;
  player.preload = "metadata";
  player.volume = volume.value;
  player.muted = muted.value;
  player.addEventListener("error", () => {
    if (!playbackExpected || audio.value !== player) return;
    playbackState.value = "error";
    errorMessage.value = "CosmoPort Radio is temporarily unavailable.";
  });
  player.addEventListener("pause", () => {
    if (!playbackExpected && playbackState.value !== "error") playbackState.value = "paused";
  });
  audio.value = player;
  return player;
}

export function useUniverseRadio() {
  const isPlaying = computed(() => playbackState.value === "playing");

  async function play() {
    const player = ensureAudio();
    if (!player) return;
    const request = ++playbackRequest;

    errorMessage.value = "";
    playbackExpected = true;
    muted.value = false;
    player.muted = false;
    player.volume = volume.value;
    playbackState.value = "loading";
    try {
      await player.play();
      if (request !== playbackRequest || !playbackExpected || audio.value !== player) {
        return;
      }
      playbackState.value = "playing";
    } catch {
      if (request !== playbackRequest || !playbackExpected || audio.value !== player) return;
      playbackState.value = "error";
      errorMessage.value = "CosmoPort Radio could not start. Please try again.";
    }
  }

  function pause() {
    playbackRequest += 1;
    playbackExpected = false;
    audio.value?.pause();
    if (playbackState.value !== "error") playbackState.value = "paused";
  }

  function toggleMute() {
    const player = ensureAudio();
    if (!player) return;
    muted.value = !muted.value;
    player.muted = muted.value;
  }

  function setVolume(nextVolume: number) {
    volume.value = Math.min(1, Math.max(0, nextVolume));
    const player = ensureAudio();
    if (player) player.volume = volume.value;
  }

  function stopForMiniApp() {
    playbackRequest += 1;
    playbackExpected = false;
    audio.value?.pause();
    if (audio.value) audio.value.currentTime = 0;
    if (playbackState.value !== "error") playbackState.value = "paused";
  }

  function dispose() {
    playbackRequest += 1;
    playbackExpected = false;
    audio.value?.pause();
    audio.value = undefined;
    playbackState.value = "idle";
  }

  return {
    volume,
    muted,
    playbackState,
    errorMessage,
    isPlaying,
    play,
    pause,
    toggleMute,
    setVolume,
    stopForMiniApp,
    dispose,
  };
}
