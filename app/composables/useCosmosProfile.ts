import { computed, watch } from "vue";
import {
  AVATARS_MEDIA,
  avatarUrl,
  isAvatarId,
  type AvatarId,
} from "../data/avatarsMedia";

type AvatarResponse = {
  avatarId: AvatarId | null;
};

const PROFILE_REQUEST_TIMEOUT_MS = 8_000;

type CosmosProfileState = {
  avatarId: AvatarId | null;
  error: boolean;
  loading: boolean;
  requestId: number;
  userId: string | null;
};

export function useCosmosProfile() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const profile = useState<CosmosProfileState>("cosmos-profile", () => ({
    avatarId: null,
    error: false,
    loading: true,
    requestId: 0,
    userId: null,
  }));

  watch(
    [isLoaded, isSignedIn, () => userId?.value ?? null],
    async ([clerkReady, signedIn, currentUserId]) => {
      const activeUserId = currentUserId?.trim() || null;

      if (!clerkReady) {
        profile.value.avatarId = null;
        profile.value.error = false;
        profile.value.loading = true;
        profile.value.userId = null;
        return;
      }

      if (!signedIn || !activeUserId) {
        profile.value.avatarId = null;
        profile.value.error = false;
        profile.value.loading = false;
        profile.value.userId = null;
        return;
      }

      if (profile.value.userId === activeUserId && (
        profile.value.loading
        || profile.value.avatarId !== null
        || profile.value.error
      )) {
        return;
      }

      profile.value.avatarId = null;
      profile.value.error = false;
      profile.value.loading = true;
      profile.value.userId = activeUserId;
      profile.value.requestId += 1;
      const requestId = profile.value.requestId;

      try {
        const response = await $fetch<AvatarResponse>(
          "/api/account/profile-avatar",
          { timeout: PROFILE_REQUEST_TIMEOUT_MS },
        );

        if (
          profile.value.userId !== activeUserId
          || profile.value.requestId !== requestId
        ) {
          return;
        }

        profile.value.avatarId = isAvatarId(response.avatarId)
          ? response.avatarId
          : null;
      } catch {
        if (
          profile.value.userId !== activeUserId
          || profile.value.requestId !== requestId
        ) {
          return;
        }

        profile.value.error = true;
      } finally {
        if (
          profile.value.userId === activeUserId
          && profile.value.requestId === requestId
        ) {
          profile.value.loading = false;
        }
      }
    },
    { immediate: true },
  );

  const avatarSrc = computed(() => {
    if (!isLoaded.value || !isSignedIn.value || profile.value.loading) {
      return null;
    }

    return avatarUrl(profile.value.avatarId) ?? AVATARS_MEDIA.astronaut;
  });

  return {
    avatarId: computed(() => profile.value.avatarId),
    avatarSrc,
    loading: computed(() => profile.value.loading),
    error: computed(() => profile.value.error),
  };
}
