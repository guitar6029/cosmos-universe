import type { SignInResource } from "@clerk/nuxt/types";
import { ref, type Ref } from "vue";

type SetActive = (input: { session: string }) => Promise<void>;
type LoginSignIn = Pick<SignInResource, "create" | "prepareSecondFactor" | "attemptSecondFactor">;
type SignInAttempt = Pick<SignInResource, "status" | "createdSessionId" | "supportedSecondFactors">;
type CodeStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

const errorMessage = (value: unknown) =>
  (value as { errors?: { longMessage?: string }[] })?.errors?.[0]?.longMessage ||
  "We couldn't complete that check-in. Please try again.";

function preferredCodeStrategy(attempt: SignInAttempt): CodeStrategy | undefined {
  const factors = attempt.supportedSecondFactors ?? [];
  for (const strategy of ["email_code", "phone_code", "totp", "backup_code"] as const) {
    if (factors.some((factor) => factor.strategy === strategy)) return strategy;
  }
}

export function usePassportOfficeLogin(
  signIn: Ref<LoginSignIn | null | undefined>,
  setActive: Ref<SetActive | undefined>,
  isLoaded: Ref<boolean>,
  complete: () => void,
) {
  const verifying = ref(false);
  const pending = ref(false);
  const error = ref("");
  const codeStrategy = ref<CodeStrategy>();

  async function activate(attempt: Pick<SignInResource, "status" | "createdSessionId">) {
    const setActiveSession = setActive.value;
    if (attempt.status !== "complete" || !attempt.createdSessionId || !setActiveSession) {
      error.value =
        "Your check-in needs another Clerk security step before its session can be activated.";
      return false;
    }
    await setActiveSession({ session: attempt.createdSessionId });
    complete();
    return true;
  }

  async function prepareVerification(attempt: SignInAttempt) {
    const strategy = preferredCodeStrategy(attempt);
    if (!strategy || !signIn.value) {
      error.value =
        "This account needs a verification method that is not available at this Passport Bureau desk.";
      return;
    }
    const factor = attempt.supportedSecondFactors?.find(
      (candidate) => candidate.strategy === strategy,
    );
    if (strategy === "email_code" && factor && "emailAddressId" in factor)
      await signIn.value.prepareSecondFactor({ strategy, emailAddressId: factor.emailAddressId });
    if (strategy === "phone_code" && factor && "phoneNumberId" in factor)
      await signIn.value.prepareSecondFactor({ strategy, phoneNumberId: factor.phoneNumberId });
    codeStrategy.value = strategy;
    verifying.value = true;
  }

  async function begin(emailAddress: string, password: string) {
    if (!isLoaded.value || !signIn.value || pending.value) return;
    pending.value = true;
    error.value = "";
    try {
      const attempt = await signIn.value.create({
        strategy: "password",
        identifier: emailAddress.trim(),
        password,
      });
      if (attempt.status === "complete") await activate(attempt);
      else if (attempt.status === "needs_client_trust" || attempt.status === "needs_second_factor")
        await prepareVerification(attempt);
      else
        error.value = "Your check-in needs another Clerk security step before it can be completed.";
    } catch (value) {
      error.value = errorMessage(value);
    } finally {
      pending.value = false;
    }
  }

  async function verify(code: string) {
    if (!isLoaded.value || !signIn.value || !codeStrategy.value || pending.value) return;
    pending.value = true;
    error.value = "";
    try {
      const attempt = await signIn.value.attemptSecondFactor({
        strategy: codeStrategy.value,
        code: code.trim(),
      });
      await activate(attempt);
    } catch (value) {
      error.value = errorMessage(value);
    } finally {
      pending.value = false;
    }
  }

  return { verifying, pending, error, begin, verify };
}
