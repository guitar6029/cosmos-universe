import { effectScope, nextTick, ref, type EffectScope, type Ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AVATARS_MEDIA } from "../app/data/avatarsMedia";
import { useCosmosProfile } from "../app/composables/useCosmosProfile";

const isLoaded = ref(true);
const isSignedIn = ref(false);
const userId = ref<string | null>(null);
const state = new Map<string, Ref<unknown>>();
const fetchProfile = vi.fn();
let scope: EffectScope;

vi.stubGlobal("useAuth", () => ({ isLoaded, isSignedIn, userId }));
vi.stubGlobal("$fetch", fetchProfile);
vi.stubGlobal("useState", <T>(key: string, init: () => T) => {
  if (!state.has(key)) {
    state.set(key, ref(init()));
  }

  return state.get(key) as Ref<T>;
});

const flush = async () => {
  await nextTick();
  await Promise.resolve();
  await nextTick();
};

describe("useCosmosProfile", () => {
  beforeEach(() => {
    scope?.stop();
    scope = effectScope();
    state.clear();
    fetchProfile.mockReset();
    isLoaded.value = true;
    isSignedIn.value = false;
    userId.value = null;
  });

  it("does not fetch for guests and clears the profile after sign-out", async () => {
    const profile = scope.run(useCosmosProfile)!;
    await flush();

    expect(fetchProfile).not.toHaveBeenCalled();
    expect(profile.loading.value).toBe(false);
    expect(profile.avatarSrc.value).toBeNull();

    isSignedIn.value = true;
    userId.value = "user_cosmo";
    fetchProfile.mockResolvedValue({ avatarId: "cat" });
    await flush();

    isSignedIn.value = false;
    userId.value = null;
    await flush();

    expect(profile.avatarId.value).toBeNull();
    expect(profile.avatarSrc.value).toBeNull();
  });

  it("shares one pending request and exposes the saved avatar to each consumer", async () => {
    let resolveProfile: (value: { avatarId: string }) => void = () => undefined;
    fetchProfile.mockReturnValue(new Promise((resolve) => {
      resolveProfile = resolve;
    }));
    isSignedIn.value = true;
    userId.value = "user_shared";

    const first = scope.run(useCosmosProfile)!;
    const second = scope.run(useCosmosProfile)!;
    await nextTick();

    expect(fetchProfile).toHaveBeenCalledOnce();
    expect(first.loading.value).toBe(true);
    expect(first.avatarSrc.value).toBeNull();
    expect(second.loading.value).toBe(true);

    resolveProfile({ avatarId: "robot" });
    await flush();

    expect(first.avatarSrc.value).toBe(AVATARS_MEDIA.robot);
    expect(second.avatarSrc.value).toBe(AVATARS_MEDIA.robot);
  });

  it("uses Astronaut only after a failed profile request", async () => {
    fetchProfile.mockRejectedValue(new Error("network unavailable"));
    isSignedIn.value = true;
    userId.value = "user_failure";

    const profile = scope.run(useCosmosProfile)!;
    await flush();

    expect(profile.loading.value).toBe(false);
    expect(profile.error.value).toBe(true);
    expect(profile.avatarSrc.value).toBe(AVATARS_MEDIA.astronaut);
  });

  it("ignores a stale response after the Clerk user changes", async () => {
    let resolveFirst: (value: { avatarId: string }) => void = () => undefined;
    let resolveSecond: (value: { avatarId: string }) => void = () => undefined;
    fetchProfile
      .mockReturnValueOnce(new Promise((resolve) => {
        resolveFirst = resolve;
      }))
      .mockReturnValueOnce(new Promise((resolve) => {
        resolveSecond = resolve;
      }));
    isSignedIn.value = true;
    userId.value = "user_first";

    const profile = scope.run(useCosmosProfile)!;
    await nextTick();

    userId.value = "user_second";
    await nextTick();
    resolveSecond({ avatarId: "alien" });
    await flush();
    resolveFirst({ avatarId: "cat" });
    await flush();

    expect(profile.avatarId.value).toBe("alien");
    expect(profile.avatarSrc.value).toBe(AVATARS_MEDIA.alien);
  });
});
