// @vitest-environment jsdom
import { createApp, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import UniverseRadioControl from "../app/components/universe/UniverseRadioControl.vue";
import { UNIVERSE_MEDIA } from "../app/data/universeMedia";

class FakeAudio {
  loop = false;
  preload = "";
  volume = 1;
  muted = false;
  currentTime = 0;
  pause = vi.fn();
  play = vi.fn().mockResolvedValue(undefined);
  addEventListener = vi.fn();
  constructor(readonly src: string) {}
}

describe("CosmoPort Radio", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    document.body.replaceChildren();
  });

  it("uses the verified, centralized Grand Concourse MP3 URL", () => {
    expect(UNIVERSE_MEDIA.interplanetaryLounge).toBe(
      "https://media.cosmos-universe.com/sounds/grand-concourse/interplanetary-lounge.mp3",
    );
  });

  it("does not construct or play audio until a visitor presses Play", async () => {
    const audioConstructor = vi.fn(function (src: string) {
      return new FakeAudio(src);
    });
    vi.stubGlobal("Audio", audioConstructor);
    const { useUniverseRadio } = await import("../app/composables/useUniverseRadio");
    const radio = useUniverseRadio();

    expect(audioConstructor).not.toHaveBeenCalled();
    await radio.play();

    const player = audioConstructor.mock.results[0]?.value as FakeAudio;
    expect(player.src).toBe(UNIVERSE_MEDIA.interplanetaryLounge);
    expect(player.loop).toBe(true);
    expect(player.play).toHaveBeenCalledOnce();
  });

  it("updates volume immediately, preserves it through mute, and stops for a mini-app", async () => {
    const audioConstructor = vi.fn(function (src: string) {
      return new FakeAudio(src);
    });
    vi.stubGlobal("Audio", audioConstructor);
    const { useUniverseRadio } = await import("../app/composables/useUniverseRadio");
    const radio = useUniverseRadio();
    await radio.play();
    const player = audioConstructor.mock.results[0]?.value as FakeAudio;

    radio.setVolume(0.24);
    radio.toggleMute();
    expect(player.volume).toBe(0.24);
    expect(player.muted).toBe(true);
    radio.toggleMute();
    expect(player.muted).toBe(false);
    expect(player.volume).toBe(0.24);
    radio.stopForMiniApp();
    expect(player.pause).toHaveBeenCalled();
    expect(player.currentTime).toBe(0);
  });

  it("cancels a pending play request when entering a mini-app", async () => {
    let resolvePlay: () => void = () => undefined;
    const pendingPlay = new Promise<void>((resolve) => {
      resolvePlay = resolve;
    });
    const audioConstructor = vi.fn(function (src: string) {
      const player = new FakeAudio(src);
      player.play.mockReturnValue(pendingPlay);
      return player;
    });
    vi.stubGlobal("Audio", audioConstructor);
    const { useUniverseRadio } = await import("../app/composables/useUniverseRadio");
    const radio = useUniverseRadio();

    const start = radio.play();
    radio.stopForMiniApp();
    resolvePlay();
    await start;

    const player = audioConstructor.mock.results[0]?.value as FakeAudio;
    expect(player.pause).toHaveBeenCalled();
    expect(radio.playbackState.value).toBe("paused");
    expect(radio.isPlaying.value).toBe(false);
  });

  it("ignores a stale play rejection after Pause", async () => {
    let rejectPlay: (reason?: unknown) => void = () => undefined;
    const pendingPlay = new Promise<void>((_resolve, reject) => {
      rejectPlay = reject;
    });
    const audioConstructor = vi.fn(function (src: string) {
      const player = new FakeAudio(src);
      player.play.mockReturnValue(pendingPlay);
      return player;
    });
    vi.stubGlobal("Audio", audioConstructor);
    const { useUniverseRadio } = await import("../app/composables/useUniverseRadio");
    const radio = useUniverseRadio();

    const start = radio.play();
    radio.pause();
    rejectPlay(new Error("autoplay interrupted"));
    await start;

    expect(radio.playbackState.value).toBe("paused");
    expect(radio.errorMessage.value).toBe("");
  });

  it("keeps the newest rapid Play request in control", async () => {
    let resolveFirst: () => void = () => undefined;
    let resolveSecond: () => void = () => undefined;
    const firstPlay = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    const secondPlay = new Promise<void>((resolve) => {
      resolveSecond = resolve;
    });
    const audioConstructor = vi.fn(function (src: string) {
      const player = new FakeAudio(src);
      player.play.mockReturnValueOnce(firstPlay).mockReturnValueOnce(secondPlay);
      return player;
    });
    vi.stubGlobal("Audio", audioConstructor);
    const { useUniverseRadio } = await import("../app/composables/useUniverseRadio");
    const radio = useUniverseRadio();

    const first = radio.play();
    const second = radio.play();
    resolveFirst();
    await first;

    const player = audioConstructor.mock.results[0]?.value as FakeAudio;
    expect(player.pause).not.toHaveBeenCalled();
    expect(radio.playbackState.value).toBe("loading");
    resolveSecond();
    await second;
    expect(radio.playbackState.value).toBe("playing");
  });

  it("offers keyboard-accessible play, mute, and volume controls in a compact popover", async () => {
    const container = document.createElement("div");
    const app = createApp(UniverseRadioControl);
    document.body.append(container);
    app.mount(container);

    container.querySelector<HTMLButtonElement>(".universe-radio__toggle")?.click();
    await nextTick();
    expect(container.querySelector('[role="group"]')?.textContent).toContain("CosmoPort Radio");
    expect(container.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(2);
    expect(
      container.querySelector(".universe-radio__toggle svg path")?.getAttribute("d"),
    ).toContain("M17.25 9.75");
    expect(
      container.querySelector(".universe-radio__action svg path")?.getAttribute("d"),
    ).toContain("M5.25 5.653");
    expect(
      container.querySelector<HTMLInputElement>('input[type="range"]')?.getAttribute("aria-label"),
    ).toBe("Radio volume");
    container
      .querySelector<HTMLInputElement>('input[type="range"]')
      ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(container.querySelector('[role="group"]')).toBeNull();
    app.unmount();
  });
});
