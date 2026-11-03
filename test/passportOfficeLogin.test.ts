import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { usePassportOfficeLogin } from "../app/composables/usePassportOfficeLogin";

const completedAttempt = {
  status: "complete",
  createdSessionId: "sess_123",
  supportedSecondFactors: null,
};

function setup(createResult = completedAttempt) {
  const signIn = {
    create: vi.fn().mockResolvedValue(createResult),
    prepareSecondFactor: vi.fn(),
    attemptSecondFactor: vi.fn().mockResolvedValue(completedAttempt),
  };
  const activate = vi.fn();
  const complete = vi.fn();
  return {
    signIn,
    activate,
    complete,
    flow: usePassportOfficeLogin(ref(signIn), ref(activate), ref(true), complete),
  };
}

describe("Passport Office returning traveler login", () => {
  it("submits credentials and activates a completed Clerk session", async () => {
    const { signIn, activate, complete, flow } = setup();
    await flow.begin(" traveler@example.com ", "Passw0rd!ForClerk");
    expect(signIn.create).toHaveBeenCalledWith({
      strategy: "password",
      identifier: "traveler@example.com",
      password: "Passw0rd!ForClerk",
    });
    expect(activate).toHaveBeenCalledWith({ session: "sess_123" });
    expect(complete).toHaveBeenCalled();
  });

  it("shows Clerk's incorrect-credentials error inline", async () => {
    const { signIn, activate, flow } = setup();
    signIn.create.mockRejectedValueOnce({
      errors: [{ longMessage: "Incorrect email address or password." }],
    });
    await flow.begin("traveler@example.com", "wrong-password");
    expect(activate).not.toHaveBeenCalled();
    expect(flow.error.value).toBe("Incorrect email address or password.");
  });

  it("does not activate an incomplete authentication attempt", async () => {
    const { activate, complete, flow } = setup({
      status: "needs_first_factor",
      createdSessionId: null,
      supportedSecondFactors: null,
    });
    await flow.begin("traveler@example.com", "Passw0rd!ForClerk");
    expect(activate).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(flow.error.value).toContain("another Clerk security step");
  });

  it("prepares and verifies the required Device Trust second factor", async () => {
    const secondFactor = {
      status: "needs_client_trust",
      createdSessionId: null,
      supportedSecondFactors: [
        {
          strategy: "email_code",
          emailAddressId: "idn_email_123",
          safeIdentifier: "t***@example.com",
        },
      ],
    };
    const { signIn, activate, complete, flow } = setup(secondFactor);
    await flow.begin("traveler@example.com", "Passw0rd!ForClerk");
    expect(signIn.prepareSecondFactor).toHaveBeenCalledWith({
      strategy: "email_code",
      emailAddressId: "idn_email_123",
    });
    expect(flow.verifying.value).toBe(true);
    await flow.verify("424242");
    expect(signIn.attemptSecondFactor).toHaveBeenCalledWith({
      strategy: "email_code",
      code: "424242",
    });
    expect(activate).toHaveBeenCalledWith({ session: "sess_123" });
    expect(complete).toHaveBeenCalled();
  });

  it("reports session activation failures without showing welcome-back confirmation", async () => {
    const { activate, complete, flow } = setup();
    activate.mockRejectedValueOnce({ errors: [{ longMessage: "Session activation failed." }] });
    await flow.begin("traveler@example.com", "Passw0rd!ForClerk");
    expect(complete).not.toHaveBeenCalled();
    expect(flow.error.value).toBe("Session activation failed.");
  });
});
