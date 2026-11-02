import { computed, ref, watch } from "vue";
import {
  AVATARS_MEDIA,
  avatarUrl,
  isAvatarId,
  type AvatarId,
} from "../data/avatarsMedia";

type AvatarResponse = {
  avatarId: AvatarId | null;
};

export function useCosmosProfile() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  const avatarId = ref<AvatarId | null>(null);
  const loading = ref(true);
  const error = ref(false);

  watch(
    [isLoaded, isSignedIn, userId],
    async ([clerkReady, signedIn, currentUserId], _previous, onCleanup) => {
      let cancelled = false;

      onCleanup(() => {
        cancelled = true;
      });

      // Clear data belonging to any previous session.
      avatarId.value = null;
      error.value = false;

      if (!clerkReady) {
        loading.value = true;
        return;
      }

      if (!signedIn || !currentUserId) {
        loading.value = false;
        return;
      }

      loading.value = true;

      try {
        const response = await $fetch<AvatarResponse>(
          "/api/account/profile-avatar",
        );

        if (cancelled) return;

        avatarId.value = isAvatarId(response.avatarId)
          ? response.avatarId
          : null;
      } catch {
        if (cancelled) return;

        error.value = true;
      } finally {
        if (!cancelled) {
          loading.value = false;
        }
      }
    },
    { immediate: true },
  );

  const avatarSrc = computed(() => {
    if (!isLoaded.value || !isSignedIn.value || loading.value) {
      return null;
    }

    return avatarUrl(avatarId.value) ?? AVATARS_MEDIA.astronaut;
  });

  return {
    avatarId,
    avatarSrc,
    loading,
    error,
  };
}
