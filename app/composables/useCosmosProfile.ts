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

type ProfileRequest = {
  requestId: number;
};

type ProfileStatus = "idle" | "loading" | "success" | "error";

type CosmosProfileState = {
  avatarId: AvatarId | null;
  error: boolean;
  loading: boolean;
  requestId: number;
  status: ProfileStatus;
  userId: string | null;
};

const inFlightProfiles = new WeakMap<object, Map<string, ProfileRequest>>();

function requestsFor(nuxtApp: object) {
  let requests = inFlightProfiles.get(nuxtApp);

  if (!requests) {
    requests = new Map<string, ProfileRequest>();
    inFlightProfiles.set(nuxtApp, requests);
  }

  return requests;
}

function resetProfile(
  profile: { value: CosmosProfileState },
  loading: boolean,
) {
  profile.value.avatarId = null;
  profile.value.error = false;
  profile.value.loading = loading;
  profile.value.requestId += 1;
  profile.value.status = "idle";
  profile.value.userId = null;
}

export function useCosmosProfile() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const requests = requestsFor(useNuxtApp());
  const profile = useState<CosmosProfileState>("cosmos-profile", () => ({
    avatarId: null,
    error: false,
    loading: true,
    requestId: 0,
    status: "idle",
    userId: null,
  }));

  watch(
    [isLoaded, isSignedIn, () => userId?.value ?? null],
    ([clerkReady, signedIn, currentUserId]) => {
      const activeUserId = currentUserId?.trim() || null;

      if (!clerkReady) {
        if (profile.value.userId !== null || !profile.value.loading) {
          resetProfile(profile, true);
        }

        return;
      }

      if (!signedIn || !activeUserId) {
        if (profile.value.userId) {
          requests.delete(profile.value.userId);
        }

        resetProfile(profile, false);
        return;
      }

      if (
        profile.value.userId === activeUserId
        && (profile.value.status === "success" || profile.value.status === "error")
      ) {
        return;
      }

      const pending = requests.get(activeUserId);

      if (
        profile.value.userId === activeUserId
        && profile.value.status === "loading"
        && pending?.requestId === profile.value.requestId
      ) {
        return;
      }

      profile.value.avatarId = null;
      profile.value.error = false;
      profile.value.loading = true;
      profile.value.requestId += 1;
      profile.value.status = "loading";
      profile.value.userId = activeUserId;
      const requestId = profile.value.requestId;

      void $fetch<AvatarResponse>(
        "/api/account/profile-avatar",
      )
        .then((response) => {
          if (
            profile.value.userId !== activeUserId
            || profile.value.requestId !== requestId
          ) {
            return;
          }

          profile.value.avatarId = isAvatarId(response.avatarId)
            ? response.avatarId
            : null;
          profile.value.status = "success";
        })
        .catch(() => {
          if (
            profile.value.userId !== activeUserId
            || profile.value.requestId !== requestId
          ) {
            return;
          }

          profile.value.error = true;
          profile.value.status = "error";
        })
        .finally(() => {
          if (requests.get(activeUserId)?.requestId === requestId) {
            requests.delete(activeUserId);
          }

          if (
            profile.value.userId === activeUserId
            && profile.value.requestId === requestId
          ) {
            profile.value.loading = false;
          }
        });

      requests.set(activeUserId, { requestId });
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
