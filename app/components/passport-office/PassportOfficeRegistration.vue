<script setup lang="ts">
import { computed, ref } from "vue";
import { useSignUp } from "@clerk/nuxt/composables";
import { PASSPORT_OFFICE_MEDIA } from "../../data/passportOfficeMedia";
import { AVATAR_IDS, AVATARS_MEDIA, type AvatarId } from "../../data/avatarsMedia";
import { usePassportOfficeRegistration } from "../../composables/usePassportOfficeRegistration";

const emit = defineEmits<{ begin: []; cancel: []; complete: [] }>();
const { isLoaded, signUp, setActive } = useSignUp();
const stage = ref<"details" | "review">("details");
const passportCoverFailed = ref(false);
const firstName = ref(""); const lastName = ref(""); const emailAddress = ref(""); const password = ref(""); const code = ref("");
const selectedAvatar = ref<AvatarId>("astronaut");
const avatarLabels: Record<AvatarId, string> = { astronaut: "Astronaut", cat: "Cat", alien: "Alien", robot: "Robot" };
const applicantName = computed(() => `${firstName.value.trim()} ${lastName.value.trim()}`.trim());
const { verifying, pending, error, begin: beginRegistration, verify: verifyCode, resend } = usePassportOfficeRegistration(signUp, setActive, isLoaded, () => emit("complete"));
function reviewApplication() { stage.value = "review"; }
function correctApplication() { stage.value = "details"; }
async function fileApplication() { emit("begin"); await beginRegistration({ firstName: firstName.value, lastName: lastName.value, emailAddress: emailAddress.value, password: password.value }); }


const fileApplicationStatus = computed(() => {
  return pending.value ? "Filing…" : "File application";
})


</script>

<template>
  <section class="passport-registration" aria-labelledby="passport-registration-title">
    <div class="passport-registration__cover"
      :class="{ 'passport-registration__cover--fallback': passportCoverFailed }">
      <img v-if="!passportCoverFailed" :src="PASSPORT_OFFICE_MEDIA.passportInterior"
        alt="CosmoPort passport registration booklet interior" @error="passportCoverFailed = true">
      <p v-else>Passport cover unavailable. Your application can still be filed.</p>
    </div>

    <form v-if="!verifying && stage === 'details'" class="passport-registration__form"
      @submit.prevent="reviewApplication">
      <p class="passport-registration__stamp">CosmoPort Passport Bureau · Form CP-1957</p>
      <h2 id="passport-registration-title">Traveler registration</h2>
      <p>Enter your particulars for Bureau review. Your password is never displayed on the review page.</p>
      <label for="passport-first-name">Given Name (First Name)</label>
      <input id="passport-first-name" v-model="firstName" name="firstName" type="text" autocomplete="given-name"
        required :disabled="pending || !isLoaded">
      <label for="passport-last-name">Family Name (Last Name)</label>
      <input id="passport-last-name" v-model="lastName" name="lastName" type="text" autocomplete="family-name" required
        :disabled="pending || !isLoaded">
      <label for="passport-email">Contact Signal (Email Address)</label>
      <input id="passport-email" v-model="emailAddress" name="emailAddress" type="email" autocomplete="email" required
        :disabled="pending || !isLoaded">
      <label for="passport-password">Secure Launch Phrase (Password)</label>
      <input id="passport-password" v-model="password" name="password" type="password" autocomplete="new-password"
        minlength="8" required :disabled="pending || !isLoaded">
      <fieldset class="passport-registration__portraits" :disabled="pending || !isLoaded">
        <legend>Traveler Portrait</legend>
        <p class="passport-registration__portrait-hint">Choose your Cosmos Universe avatar.</p>
        <div class="passport-registration__portrait-options">
          <label v-for="avatarId in AVATAR_IDS" :key="avatarId" class="passport-registration__portrait-option"
            :class="{ 'passport-registration__portrait-option--selected': selectedAvatar === avatarId }">
            <input v-model="selectedAvatar" type="radio" name="travelerPortrait" :value="avatarId">
            <span class="passport-registration__portrait-tile">
              <span v-if="selectedAvatar === avatarId" class="passport-registration__portrait-tab">Selected</span>
              <img :src="AVATARS_MEDIA[avatarId]" alt="">
            </span>
            <span class="passport-registration__visually-hidden">{{ avatarLabels[avatarId] }}</span>
          </label>
        </div>
      </fieldset>
      <p v-if="!isLoaded" class="passport-registration__hint" role="status">Preparing the secure application desk…</p>
      <button type="submit" :disabled="pending || !isLoaded">Review application</button>
      <button type="button" class="passport-registration__secondary" :disabled="pending" @click="emit('cancel')">Back to
        the office</button>
    </form>

    <div v-else-if="!verifying" class="passport-registration__form passport-registration__review"
      aria-labelledby="passport-registration-title">
      <p class="passport-registration__stamp">CosmoPort Passport Bureau · Review desk</p>
      <h2 id="passport-registration-title">Confirm registration particulars</h2>
      <dl>
        <div>
          <dt>Traveler</dt>
          <dd>{{ applicantName }}</dd>
        </div>
        <div>
          <dt>Email address</dt>
          <dd>{{ emailAddress.trim() }}</dd>
        </div>
      </dl>
      <p>Your secure launch phrase is protected and will not be displayed here.</p>
      <p v-if="error" class="passport-registration__error" role="alert">{{ error }}</p>
      <button type="button" :disabled="pending || !isLoaded" @click="fileApplication">{{ fileApplicationStatus
        }}</button>
      <button type="button" class="passport-registration__secondary" :disabled="pending"
        @click="correctApplication">Make corrections</button>
      <button type="button" class="passport-registration__secondary" :disabled="pending" @click="emit('cancel')">Cancel
        application</button>
    </div>

    <form v-else class="passport-registration__form" @submit.prevent="verifyCode(code)">
      <p class="passport-registration__stamp">CosmoPort Passport Bureau · Signal verification</p>
      <h2 id="passport-registration-title">Confirm contact signal</h2>
      <p>Enter the code Clerk sent to <strong>{{ emailAddress.trim() }}</strong>. A Clerk security challenge may appear
        in a separate dialog when required.</p>
      <label for="passport-verification-code">Verification code</label>
      <input id="passport-verification-code" v-model="code" name="verificationCode" inputmode="numeric"
        autocomplete="one-time-code" required :disabled="pending">
      <p v-if="error" class="passport-registration__error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="pending">{{ pending ? "Verifying…" : "Verify email and activate" }}</button>
      <button type="button" class="passport-registration__secondary" :disabled="pending" @click="resend">Resend
        code</button>
      <button type="button" class="passport-registration__secondary" :disabled="pending" @click="emit('cancel')">Cancel
        application</button>
    </form>
  </section>
</template>

<style scoped src="./PassportOfficeRegistration.css"></style>
