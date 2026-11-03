<script setup lang="ts">
import { ref } from "vue";
import { useSignIn } from "@clerk/nuxt/composables";
import { PASSPORT_OFFICE_MEDIA } from "../../data/passportOfficeMedia";
import { usePassportOfficeLogin } from "../../composables/usePassportOfficeLogin";

const props = defineProps<{ isSignedIn: boolean }>();
const emit = defineEmits<{ begin: []; cancel: []; complete: [] }>();
const { isLoaded, signIn, setActive } = useSignIn();
const passportInteriorFailed = ref(false);
const emailAddress = ref("");
const password = ref("");
const code = ref("");
const { verifying, pending, error, begin, verify } = usePassportOfficeLogin(
  signIn,
  setActive,
  isLoaded,
  () => emit("complete"),
);
function beginCheckIn() {
  emit("begin");
  return begin(emailAddress.value, password.value);
}
</script>

<template>
  <section class="passport-login" aria-labelledby="passport-login-title">
    <div
      class="passport-login__cover"
      :class="{ 'passport-login__cover--fallback': passportInteriorFailed }"
    >
      <img
        v-if="!passportInteriorFailed"
        :src="PASSPORT_OFFICE_MEDIA.passportInterior"
        alt="CosmoPort passport registration booklet interior"
        @error="passportInteriorFailed = true"
      />
      <p v-else>Passport cover unavailable. Your check-in can still be completed.</p>
    </div>

    <div
      v-if="props.isSignedIn"
      class="passport-login__form"
      aria-labelledby="passport-login-title"
    >
      <p class="passport-login__stamp">CosmoPort Passport Bureau · Identity Verification</p>
      <h2 id="passport-login-title">Welcome back, traveler</h2>
      <p role="status">
        Your CosmoPort session is already active. No additional credentials are needed.
      </p>
      <button type="button" class="passport-login__secondary" @click="emit('cancel')">
        Back to the Office
      </button>
    </div>

    <form v-else-if="!verifying" class="passport-login__form" @submit.prevent="beginCheckIn">
      <p class="passport-login__stamp">CosmoPort Passport Bureau · Identity Verification</p>
      <h2 id="passport-login-title">Returning Traveler Check-In</h2>
      <label for="passport-login-email">Contact Signal (Email Address)</label>
      <input
        id="passport-login-email"
        v-model="emailAddress"
        name="emailAddress"
        type="email"
        autocomplete="email"
        required
        :disabled="pending || !isLoaded"
      />
      <label for="passport-login-password">Secure Launch Phrase (Password)</label>
      <input
        id="passport-login-password"
        v-model="password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        :disabled="pending || !isLoaded"
      />
      <p v-if="!isLoaded" class="passport-login__hint" role="status">
        Preparing the secure check-in desk…
      </p>
      <p v-if="error" class="passport-login__error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="pending || !isLoaded">
        {{ pending ? "Checking credentials…" : "Present Credentials" }}
      </button>
      <button
        type="button"
        class="passport-login__secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Back to the Office
      </button>
    </form>

    <form v-else class="passport-login__form" @submit.prevent="verify(code)">
      <p class="passport-login__stamp">CosmoPort Passport Bureau · Identity Verification</p>
      <h2 id="passport-login-title">Confirm your identity</h2>
      <p>Clerk requires one more verification step before this device can be trusted.</p>
      <label for="passport-login-code">Verification code</label>
      <input
        id="passport-login-code"
        v-model="code"
        name="verificationCode"
        inputmode="numeric"
        autocomplete="one-time-code"
        required
        :disabled="pending"
      />
      <p v-if="error" class="passport-login__error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="pending">
        {{ pending ? "Verifying…" : "Verify identity and activate" }}
      </button>
      <button
        type="button"
        class="passport-login__secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Back to the Office
      </button>
    </form>
  </section>
</template>

<style scoped>
.passport-login {
  display: grid;
  grid-template-columns: minmax(18rem, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(1.25rem, 3vw, 3rem);
  align-items: stretch;
  margin: 0;
}
.passport-login__cover {
  display: grid;
  min-height: 34rem;
  place-items: center;
  overflow: hidden;
  padding: 0;
  background: #173c47;
}
.passport-login__cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.passport-login__cover--fallback {
  color: #fff3d7;
  text-align: center;
  font-weight: 700;
}
.passport-login__cover--fallback p {
  padding: 1.5rem;
}
.passport-login__form {
  display: grid;
  gap: 0.7rem;
  align-content: start;
  padding: clamp(0.5rem, 1vw, 1rem) clamp(0.35rem, 1vw, 1rem);
}
.passport-login__form p,
.passport-login__form h2 {
  margin: 0;
}
.passport-login__form h2 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.5rem, 3vw, 2.15rem);
}
.passport-login__stamp {
  color: #b8493a;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.passport-login__form label {
  display: grid;
  gap: 0.3rem;
  font-weight: 800;
}
.passport-login__form input {
  border: 2px solid #173c47;
  border-radius: 0.45rem;
  padding: 0.65rem;
  background: #fffdf5;
  color: #173c47;
  font: inherit;
}
.passport-login__form button {
  border: 2px solid #173c47;
  border-radius: 0.65rem;
  padding: 0.72rem;
  background: #78c5bf;
  color: #173c47;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.passport-login__form button:hover {
  background: #ee8e71;
}
.passport-login__form button:focus-visible,
.passport-login__form input:focus-visible {
  outline: 3px solid #b8493a;
  outline-offset: 3px;
}
.passport-login__form button:disabled,
.passport-login__form input:disabled {
  opacity: 0.65;
  cursor: wait;
}
.passport-login__secondary {
  background: #fff3d7 !important;
}
.passport-login__error {
  color: #912c21;
  font-weight: 800;
}
.passport-login__hint {
  font-weight: 700;
}
@media (max-width: 44rem) {
  .passport-login {
    grid-template-columns: 1fr;
  }
  .passport-login__cover {
    min-height: 18rem;
  }
  .passport-login__form {
    padding: 0.5rem 0;
  }
}
</style>
