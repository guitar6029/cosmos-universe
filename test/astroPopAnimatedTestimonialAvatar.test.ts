// @vitest-environment jsdom
import { createApp, h, nextTick, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AstroPopAnimatedTestimonialAvatar from "../app/components/astro-pop/AstroPopAnimatedTestimonialAvatar.vue";
import AstroPopDeliveryTestimonialsSection from "../app/components/astro-pop/AstroPopDeliveryTestimonialsSection.vue";
import { ASTRO_POP_MEDIA } from "../app/data/astroPopMedia";

const imageSrc = ASTRO_POP_MEDIA.testimonials.dorothy.portrait;
const videoSrc = ASTRO_POP_MEDIA.testimonials.dorothy.video;
const testimonialMedia = [
  {
    imageSrc,
    videoSrc,
  },
  {
    imageSrc: ASTRO_POP_MEDIA.testimonials.walter.portrait,
    videoSrc: ASTRO_POP_MEDIA.testimonials.walter.video,
  },
  {
    imageSrc: ASTRO_POP_MEDIA.testimonials.grandpaHenry.portrait,
    videoSrc: ASTRO_POP_MEDIA.testimonials.grandpaHenry.video,
  },
];

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean, ratio = 0.7) {
    this.callback(
      [{ isIntersecting, intersectionRatio: ratio } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

const mountAvatar = () => {
  const container = document.createElement("div");
  const avatar = ref<{ replayOnHover: () => void } | null>(null);
  const app = createApp({
    render: () =>
      h(AstroPopAnimatedTestimonialAvatar, {
        ref: avatar,
        imageSrc,
        imageAlt: "Dorothy Miller holding a bottle of AstroPop soda",
        videoSrc,
        replayLabel: "Replay Dorothy Miller's animation",
      }),
  });

  app.mount(container);
  return { app, avatar, container };
};

const mountTestimonials = () => {
  const container = document.createElement("div");
  const app = createApp(AstroPopDeliveryTestimonialsSection);

  app.mount(container);
  return { app, container };
};

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  MockIntersectionObserver.instances = [];
  document.body.replaceChildren();
});

describe("AstroPop animated testimonial avatar", () => {
  it("starts with the static image, then plays the video once after it becomes visible", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    const { app, container } = mountAvatar();

    expect(container.querySelector(`img[src="${imageSrc}"]`)).not.toBeNull();
    expect(container.querySelector("video")).toBeNull();
    expect(MockIntersectionObserver.instances).toHaveLength(1);

    MockIntersectionObserver.instances[0].trigger(true);
    await nextTick();
    await nextTick();

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect((video as HTMLVideoElement | null)?.muted).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect(video?.hasAttribute("loop")).toBe(false);
    expect(play).toHaveBeenCalledTimes(1);
    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalledTimes(1);

    video?.dispatchEvent(new Event("playing"));
    await nextTick();
    expect(video?.classList.contains("astropop-animated-testimonial-avatar__video--playing")).toBe(
      true,
    );

    video?.dispatchEvent(new Event("ended"));
    await nextTick();
    expect(video?.classList.contains("astropop-animated-testimonial-avatar__video--playing")).toBe(
      false,
    );
    expect(container.querySelector(`img[src="${imageSrc}"]`)).not.toBeNull();

    MockIntersectionObserver.instances[0].trigger(true);
    await nextTick();
    expect(play).toHaveBeenCalledTimes(1);

    app.unmount();
  });

  it("replays after a completed hover cycle without interrupting active playback", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(hover: hover)" })),
    );
    const { app, avatar, container } = mountAvatar();

    avatar.value?.replayOnHover();
    avatar.value?.replayOnHover();
    await nextTick();
    await nextTick();

    const video = container.querySelector("video");
    expect(play).toHaveBeenCalledTimes(1);
    video?.dispatchEvent(new Event("playing"));
    await nextTick();

    avatar.value?.replayOnHover();
    expect(play).toHaveBeenCalledTimes(1);

    video?.dispatchEvent(new Event("ended"));
    await nextTick();
    avatar.value?.replayOnHover();
    expect(play).toHaveBeenCalledTimes(1);

    const transitionEnd = new Event("transitionend");
    Object.defineProperty(transitionEnd, "propertyName", { value: "opacity" });
    video?.dispatchEvent(transitionEnd);
    avatar.value?.replayOnHover();
    await nextTick();
    expect(play).toHaveBeenCalledTimes(2);

    app.unmount();
  });

  it("starts a replay from Dorothy's testimonial container and ignores active re-entry", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(hover: hover)" })),
    );
    const { app, container } = mountTestimonials();

    const dorothyTestimonial = container.querySelector(".astropop-testimonial");
    dorothyTestimonial?.dispatchEvent(new Event("pointerenter"));
    await nextTick();
    await nextTick();

    expect(play).toHaveBeenCalledTimes(1);
    const video = container.querySelector(`video[src="${videoSrc}"]`);
    expect(video).not.toBeNull();

    video?.dispatchEvent(new Event("playing"));
    dorothyTestimonial?.dispatchEvent(new Event("pointerleave"));
    dorothyTestimonial?.dispatchEvent(new Event("pointerenter"));
    expect(play).toHaveBeenCalledTimes(1);

    video?.dispatchEvent(new Event("ended"));
    await nextTick();
    const transitionEnd = new Event("transitionend");
    Object.defineProperty(transitionEnd, "propertyName", { value: "opacity" });
    video?.dispatchEvent(transitionEnd);
    dorothyTestimonial?.dispatchEvent(new Event("pointerleave"));
    dorothyTestimonial?.dispatchEvent(new Event("pointerenter"));
    await nextTick();
    expect(play).toHaveBeenCalledTimes(2);

    app.unmount();
  });

  it("autoplays and replays every testimonial avatar with the shared lifecycle", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(hover: hover)" })),
    );
    const { app, container } = mountTestimonials();

    expect(MockIntersectionObserver.instances).toHaveLength(3);
    MockIntersectionObserver.instances.forEach((observer) => observer.trigger(true));
    await nextTick();
    await nextTick();

    expect(play).toHaveBeenCalledTimes(3);
    testimonialMedia.forEach(({ imageSrc: testimonialImageSrc, videoSrc: testimonialVideoSrc }) => {
      expect(container.querySelector(`img[src="${testimonialImageSrc}"]`)).not.toBeNull();
      expect(container.querySelector(`video[src="${testimonialVideoSrc}"]`)).not.toBeNull();
    });

    const cards = [...container.querySelectorAll(".astropop-testimonial")];
    const videos = testimonialMedia.map(({ videoSrc: testimonialVideoSrc }) =>
      container.querySelector(`video[src="${testimonialVideoSrc}"]`),
    );

    videos.forEach((video) => {
      video?.dispatchEvent(new Event("playing"));
      video?.dispatchEvent(new Event("ended"));
      const transitionEnd = new Event("transitionend");
      Object.defineProperty(transitionEnd, "propertyName", { value: "opacity" });
      video?.dispatchEvent(transitionEnd);
    });
    await nextTick();

    cards.forEach((card) => {
      card.dispatchEvent(new Event("pointerleave"));
      card.dispatchEvent(new Event("pointerenter"));
    });
    await nextTick();

    expect(play).toHaveBeenCalledTimes(6);
    app.unmount();
  });

  it("offers tap replay on touch devices without restarting an active video", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(hover: none) and (pointer: coarse)" })),
    );
    const { app, container } = mountTestimonials();
    await nextTick();

    const buttons = [
      ...container.querySelectorAll<HTMLButtonElement>(
        ".astropop-animated-testimonial-avatar__replay",
      ),
    ];
    expect(buttons).toHaveLength(3);
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Replay Dorothy Miller's animation",
      "Replay Walter Peterson's animation",
      "Replay Grandpa Henry's animation",
    ]);
    expect(play).not.toHaveBeenCalled();

    buttons[0].click();
    buttons[0].click();
    await nextTick();
    await nextTick();
    expect(play).toHaveBeenCalledTimes(1);

    const video = container.querySelector<HTMLVideoElement>(`video[src="${videoSrc}"]`);
    video?.dispatchEvent(new Event("playing"));
    buttons[0].click();
    expect(play).toHaveBeenCalledTimes(1);

    video?.dispatchEvent(new Event("ended"));
    await nextTick();
    buttons[0].click();
    expect(play).toHaveBeenCalledTimes(1);

    const transitionEnd = new Event("transitionend");
    Object.defineProperty(transitionEnd, "propertyName", { value: "opacity" });
    video?.dispatchEvent(transitionEnd);
    buttons[0].click();
    await nextTick();
    expect(play).toHaveBeenCalledTimes(2);

    buttons[1].click();
    await nextTick();
    await nextTick();
    expect(play).toHaveBeenCalledTimes(3);

    app.unmount();
  });

  it("autoplays on touch devices only after 60% of the avatar is visible", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(hover: none) and (pointer: coarse)" })),
    );
    const { app, container } = mountAvatar();
    await nextTick();

    expect(container.querySelector(".astropop-animated-testimonial-avatar__replay")).not.toBeNull();
    MockIntersectionObserver.instances[0].trigger(true, 0.3);
    await nextTick();
    expect(play).not.toHaveBeenCalled();

    MockIntersectionObserver.instances[0].trigger(true, 0.6);
    await nextTick();
    await nextTick();
    expect(play).toHaveBeenCalledTimes(1);
    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalledTimes(1);
    app.unmount();
  });

  it("retains the static image if playback fails", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValue(new Error("Playback blocked"));
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(hover: hover)" })),
    );
    const { app, avatar, container } = mountAvatar();

    avatar.value?.replayOnHover();
    await nextTick();
    await nextTick();

    expect(play).toHaveBeenCalledTimes(1);
    expect(container.querySelector(`img[src="${imageSrc}"]`)).not.toBeNull();
    expect(
      container
        .querySelector("video")
        ?.classList.contains("astropop-animated-testimonial-avatar__video--playing"),
    ).toBe(false);

    app.unmount();
  });

  it("does not replay for reduced motion or devices without hover", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" })),
    );
    const { app, avatar, container } = mountAvatar();

    avatar.value?.replayOnHover();

    expect(play).not.toHaveBeenCalled();
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector(".astropop-animated-testimonial-avatar__replay")).toBeNull();

    app.unmount();
  });

  it("keeps the image static when reduced motion is requested", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const { app, container } = mountAvatar();

    expect(container.querySelector(`img[src="${imageSrc}"]`)).not.toBeNull();
    expect(container.querySelector("video")).toBeNull();
    expect(MockIntersectionObserver.instances).toHaveLength(0);

    app.unmount();
  });
});
