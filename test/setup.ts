import { ref, type Ref } from "vue";
import { vi } from "vitest";

const state = new Map<string, Ref<unknown>>();

// Standalone Vue tests do not run Nuxt's Clerk auto-import registration.
// Individual tests can override this default with vi.stubGlobal as needed.
vi.stubGlobal("useAuth", () => ({
  isLoaded: ref(true),
  isSignedIn: ref(false),
  signOut: vi.fn(),
}));

vi.stubGlobal("useState", <T>(key: string, init: () => T) => {
  if (!state.has(key)) {
    state.set(key, ref(init()));
  }

  return state.get(key) as Ref<T>;
});
