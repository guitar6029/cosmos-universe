import type { SignUpResource } from "@clerk/nuxt/types";
import { ref, type Ref } from "vue";
import type { AvatarId } from "../data/avatarsMedia";

type SetActive = (input: { session: string }) => Promise<void>;
type Application = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  avatarId: AvatarId;
};
type RegistrationSignUp = Pick<
  SignUpResource,
  | "create"
  | "prepareEmailAddressVerification"
  | "attemptEmailAddressVerification"
>;
const errorMessage = (value: unknown) =>
  (value as { errors?: { longMessage?: string }[] })?.errors?.[0]
    ?.longMessage || "We couldn't complete that step. Please try again.";

export function usePassportOfficeRegistration(
  signUp: Ref<RegistrationSignUp | null | undefined>,
  setActive: Ref<SetActive | undefined>,
  isLoaded: Ref<boolean>,
  complete: () => void,
) {
  const verifying = ref(false);
  const pending = ref(false);
  const error = ref("");

  async function begin(application: Application) {
    if (!isLoaded.value || !signUp.value || pending.value) {
      return;
    }

    pending.value = true;
    error.value = "";

    try {
      const attempt = await signUp.value.create({
        firstName: application.firstName.trim(),
        lastName: application.lastName.trim(),
        emailAddress: application.emailAddress.trim(),
        password: application.password,
        unsafeMetadata: {
          avatarId: application.avatarId,
        },
      });
      await attempt.prepareEmailAddressVerification({ strategy: "email_code" });
      verifying.value = true;
    } catch (value) {
      error.value = errorMessage(value);
    } finally {
      pending.value = false;
    }
  }

  async function verify(code: string) {
    if (!isLoaded.value || !signUp.value || pending.value) {
      return;
    }

    pending.value = true;
    error.value = "";

    try {
      const attempt = await signUp.value.attemptEmailAddressVerification({
        code: code.trim(),
      });
      const activate = setActive.value;
      if (
        attempt.status !== "complete" ||
        !attempt.createdSessionId ||
        !activate
      ) {
        error.value =
          "Your application needs another Clerk security step before its session can be activated.";
        return;
      }
      await activate({ session: attempt.createdSessionId });
      complete();
    } catch (value) {
      error.value = errorMessage(value);
    } finally {
      pending.value = false;
    }
  }

  async function resend() {
    if (!signUp.value || pending.value) {
      return;
    }

    pending.value = true;
    error.value = "";

    try {
      await signUp.value.prepareEmailAddressVerification({
        strategy: "email_code",
      });
    } catch (value) {
      error.value = errorMessage(value);
    } finally {
      pending.value = false;
    }
  }

  return { verifying, pending, error, begin, verify, resend };
}
