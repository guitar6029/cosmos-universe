<script setup lang="ts">
import { computed } from "vue";
import CosmoportAppToggleActive from "../components/admin/CosmoportAppToggleActive.vue";
import type { CosmoportApp } from "../../shared/types/cosmoportApp";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const { data, status, error, refresh } = await useFetch("/api/admin/apps");

const noApps = computed(() => status.value === "success" && data.value?.apps.length === 0);

function handleAppUpdated(updatedApp: CosmoportApp) {
  const app = data.value?.apps.find((item) => item.id === updatedApp.id);
  if (app) Object.assign(app, updatedApp);
}
</script>

<template>
  <section aria-labelledby="admin-dashboard-title" class="flex flex-col gap-5">
    <header class="space-y-2">
      <h1 id="admin-dashboard-title" class="text-2xl font-bold">App Management</h1>
      <p class="max-w-2xl text-sm">
        Manage the availability flag for each CosmoPort experience. Public route restrictions will
        be implemented separately.
      </p>
    </header>

    <p v-if="status === 'pending'" role="status">Loading applications…</p>
    <div v-else-if="error" role="alert" class="space-y-2">
      <p>Unable to load applications. Please try again.</p>
      <button type="button" class="btn btn-sm" @click="refresh()">Retry</button>
    </div>
    <p v-else-if="noApps">No applications registered yet.</p>
    <div v-else-if="data" class="grid gap-4">
      <article
        v-for="app in data.apps"
        :key="app.id"
        class="flex flex-col gap-4 rounded-lg border-2 border-[#c2a46d] bg-[#fff8e8] p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0 space-y-1">
          <h2 class="text-lg font-bold">{{ app.title }}</h2>
          <p class="text-sm">{{ app.description }}</p>
        </div>
        <CosmoportAppToggleActive
          :app-id="app.id"
          :app-title="app.title"
          :enabled="app.enabled"
          @updated="handleAppUpdated"
        />
      </article>
    </div>
  </section>
</template>
