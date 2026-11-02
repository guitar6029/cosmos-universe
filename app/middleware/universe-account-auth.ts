/** Require a verified server-side Clerk session for the shared profile. */
export default defineNuxtRouteMiddleware(async () => {
  try {
    const result = await useRequestFetch()<{ authenticated: boolean }>("/api/account/session");
    if (result.authenticated === true) return;
  } catch {
    // Fail closed if authentication cannot be verified.
  }
  return navigateTo("/passport-office?intent=sign-in");
});
