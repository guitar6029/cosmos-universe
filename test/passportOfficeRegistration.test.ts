import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { usePassportOfficeRegistration } from "../app/composables/usePassportOfficeRegistration";

const setup = (result = { status: "complete", createdSessionId: "sess_123" }) => {
  const signUp = {
    create: vi.fn(),
    prepareEmailAddressVerification: vi.fn(),
    attemptEmailAddressVerification: vi.fn().mockResolvedValue(result),
  };
  signUp.create.mockResolvedValue({
    prepareEmailAddressVerification: signUp.prepareEmailAddressVerification,
  });
  const activate = vi.fn();
  const complete = vi.fn();

  return {
    signUp,
    activate,
    complete,
    flow: usePassportOfficeRegistration(ref(signUp), ref(activate), ref(true), complete),
  };
};

describe("Passport Office Clerk registration", () => {
  it("creates, prepares, verifies, and activates a completed session", async () => {
    const { signUp, activate, complete, flow } = setup();

    await flow.begin({
      firstName: "  Vera ",
      lastName: " Vega ",
      emailAddress: " visitor@example.com ",
      password: "safe-password",
      avatarId: "cat",
    });

    expect(signUp.create).toHaveBeenCalledWith({
      firstName: "Vera",
      lastName: "Vega",
      emailAddress: "visitor@example.com",
      password: "safe-password",
      unsafeMetadata: { avatarId: "cat" },
    });
    expect(signUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: "email_code",
    });

    await flow.verify("123456");

    expect(activate).toHaveBeenCalledWith({ session: "sess_123" });
    expect(complete).toHaveBeenCalled();
  });
  it("handles an invalid code and incomplete attempts without activation", async () => { const { signUp, activate, flow } = setup({ status: "missing_requirements", createdSessionId: null }); await flow.verify("bad"); expect(activate).not.toHaveBeenCalled(); expect(flow.error.value).toContain("security step"); signUp.attemptEmailAddressVerification.mockRejectedValueOnce({ errors: [{ longMessage: "That code is invalid." }] }); await flow.verify("bad"); expect(flow.error.value).toBe("That code is invalid."); });
  it("keeps completion pending when session activation fails and supports resend", async () => { const { signUp, activate, complete, flow } = setup(); activate.mockRejectedValueOnce({ errors: [{ longMessage: "Activation failed." }] }); await flow.verify("123456"); expect(complete).not.toHaveBeenCalled(); expect(flow.error.value).toBe("Activation failed."); await flow.resend(); expect(signUp.prepareEmailAddressVerification).toHaveBeenCalledWith({ strategy: "email_code" }); });
});
