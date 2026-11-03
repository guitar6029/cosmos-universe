import { ref } from "vue";
import type { SignInResource, SignUpResource } from "@clerk/nuxt/types";

// Standard Playwright runs have no Clerk development credentials. This module
// is only resolved while PLAYWRIGHT_TEST=true; real Clerk tests use the normal
// module and development instance in playwright.clerk.config.ts.
const isLoaded = ref(true);
const isSignedIn = ref(
  typeof window !== "undefined" &&
    window.localStorage.getItem("playwright-clerk-authenticated") === "true",
);
const user = ref(isSignedIn.value ? {} : null);
const signOut = ref(async () => undefined);
const signIn = ref<SignInResource>();
const signUp = ref<SignUpResource>();

export function useAuth() {
  return { isLoaded, isSignedIn, signOut, setActive: ref(undefined) };
}

export function useUser() {
  return { user };
}

export function useSignIn() {
  return { isLoaded, signIn };
}

export function useSignUp() {
  return { isLoaded, signUp };
}
