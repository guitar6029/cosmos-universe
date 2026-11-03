/** All managed mini-app routes live under /app/:appId. */
export default defineNuxtRouteMiddleware(async (to) => {
  const [, namespace, appId] = to.path.split("/");
  if (namespace !== "app") return;

  if (!appId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(appId) || appId.length > 64) {
    return abortNavigation(
      createError({ statusCode: 404, statusMessage: "Application not found" }),
    );
  }

  let allowed: boolean | null;
  try {
    const response = await useRequestFetch()<{
      allowed: boolean | null;
    }>(`/api/apps/${encodeURIComponent(appId)}/access`);
    allowed = response.allowed;
  } catch {
    // Availability cannot be established. Never show a managed app by default.
    return abortNavigation(
      createError({
        statusCode: 503,
        statusMessage: "Application availability unavailable",
      }),
    );
  }

  if (allowed === true) return;
  if (allowed === false) return navigateTo("/coming-soon");

  return abortNavigation(createError({ statusCode: 404, statusMessage: "Application not found" }));
});
