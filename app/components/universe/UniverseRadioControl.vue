<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import IconPause from "../icons/IconPause.vue";
import IconPlay from "../icons/IconPlay.vue";
import IconVolumeOff from "../icons/IconVolumeOff.vue";
import IconVolumeOn from "../icons/IconVolumeOn.vue";
import { useUniverseRadio } from "../../composables/useUniverseRadio";

const {
  errorMessage,
  isPlaying,
  muted,
  playbackState,
  setVolume,
  toggleMute,
  volume,
  play,
  pause,
} = useUniverseRadio();
const open = ref(false);
const toggle = ref<HTMLButtonElement>();
const firstAction = ref<HTMLButtonElement>();
const label = computed(() =>
  isPlaying.value && !muted.value ? "Pause CosmoPort Radio" : "Open CosmoPort Radio controls",
);

function close(restoreFocus = false) {
  open.value = false;
  if (restoreFocus) void nextTick(() => toggle.value?.focus());
}

function togglePopover() {
  open.value = !open.value;
  if (open.value) void nextTick(() => firstAction.value?.focus());
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    close(true);
  }
}

function handleVolume(event: Event) {
  setVolume(Number((event.target as HTMLInputElement).value) / 100);
}

onBeforeUnmount(() => close());
</script>

<template>
  <div class="universe-radio" @keydown="handleKeydown">
    <button
      ref="toggle"
      class="universe-radio__toggle"
      type="button"
      :aria-expanded="open"
      aria-controls="universe-radio-controls"
      :aria-label="label"
      @click="togglePopover"
    >
      <IconVolumeOn v-if="isPlaying && !muted" class="universe-radio__icon" />
      <IconVolumeOff v-else class="universe-radio__icon" />
      <span class="universe-radio__label">Radio</span>
    </button>
    <div
      v-if="open"
      id="universe-radio-controls"
      class="universe-radio__panel"
      role="group"
      aria-label="CosmoPort Radio controls"
    >
      <p class="universe-radio__title">CosmoPort Radio</p>
      <button
        ref="firstAction"
        class="universe-radio__action"
        type="button"
        :disabled="playbackState === 'loading'"
        @click="isPlaying ? pause() : play()"
      >
        <IconPause v-if="isPlaying" class="universe-radio__icon" />
        <IconPlay v-else class="universe-radio__icon" />
        {{ playbackState === "loading" ? "Loading…" : isPlaying ? "Pause" : "Play" }}
      </button>
      <button
        class="universe-radio__action universe-radio__action--quiet"
        type="button"
        @click="toggleMute"
      >
        {{ muted ? "Unmute" : "Mute" }}
      </button>
      <label class="universe-radio__volume"
        >Volume <output>{{ Math.round(volume * 100) }}%</output>
        <input
          aria-label="Radio volume"
          type="range"
          min="0"
          max="100"
          :value="Math.round(volume * 100)"
          @input="handleVolume"
        />
      </label>
      <p v-if="errorMessage" class="universe-radio__error" role="alert">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.universe-radio {
  position: relative;
  flex: 0 0 auto;
}
.universe-radio__toggle,
.universe-radio__action {
  border: 1px solid var(--cp-universe-gold);
  border-radius: 0.4rem;
  font: inherit;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}
.universe-radio__toggle {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.5rem;
  background: transparent;
  color: var(--cp-universe-cream);
  font-size: 0.7rem;
}
.universe-radio__toggle:hover,
.universe-radio__toggle[aria-expanded="true"] {
  background: var(--cp-universe-gold);
  color: var(--cp-universe-space-teal-deep);
}
.universe-radio__panel {
  position: absolute;
  z-index: 3;
  top: calc(100% + 0.5rem);
  right: 0;
  display: grid;
  width: min(15rem, calc(100vw - 2rem));
  gap: 0.45rem;
  border: 1px solid var(--cp-universe-gold);
  border-radius: var(--cp-universe-plaque-radius);
  padding: 0.75rem;
  background: var(--cp-universe-space-teal);
  box-shadow: var(--cp-universe-plaque-shadow);
  color: var(--cp-universe-cream);
}
.universe-radio__title {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 800;
}
.universe-radio__action {
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.55rem;
  background: var(--cp-universe-gold);
  color: var(--cp-universe-space-teal-deep);
  font-size: 0.72rem;
}
.universe-radio__icon {
  width: 1.35rem;
  height: 1.35rem;
  flex: 0 0 auto;
}
.universe-radio__action--quiet {
  background: transparent;
  color: inherit;
}
.universe-radio__volume {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.35rem 0.5rem;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
}
.universe-radio__volume input {
  grid-column: 1 / -1;
  width: 100%;
  accent-color: var(--cp-universe-gold);
}
.universe-radio__error {
  margin: 0;
  color: #ffd281;
  font-size: 0.72rem;
  line-height: 1.35;
}
.universe-radio__toggle:focus-visible,
.universe-radio__action:focus-visible,
.universe-radio__volume input:focus-visible {
  outline: 3px solid var(--cp-universe-cream);
  outline-offset: 3px;
}
@media (max-width: 30rem) {
  .universe-radio__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
  .universe-radio__toggle {
    min-width: 2.5rem;
    justify-content: center;
    padding: 0.35rem;
  }
}
</style>
