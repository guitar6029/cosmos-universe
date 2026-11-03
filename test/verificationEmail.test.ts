import { describe, expect, it } from "vitest";
import { renderVerificationEmail } from "../server/utils/email/verification";

describe("renderVerificationEmail", () => {
  it("renders the OTP and Cosmos Universe branding", () => {
    const html = renderVerificationEmail({ otpCode: "123456" });

    expect(html).toContain("COSMOS UNIVERSE");
    expect(html).toContain("THE COSMIC ACCESS NETWORK");
    expect(html).toContain("Your Cosmic Access Code");
    expect(html).toMatch(/>\s*123456\s*<\/span>/);
    expect(html).toContain(`&copy; ${new Date().getUTCFullYear()} Cosmos Universe`);
  });

  it.each(["", "12345", "1234567", "12345a", "<script>alert(1)</script>"])(
    "rejects an invalid OTP before it can be interpolated into HTML: %s",
    (otpCode) => {
      expect(() => renderVerificationEmail({ otpCode })).toThrow("Invalid verification code");
    },
  );

  it("does not render unescaped HTML supplied as an OTP", () => {
    const maliciousOtp = "<img src=x onerror=alert(1)>";

    expect(() => renderVerificationEmail({ otpCode: maliciousOtp })).toThrow(
      "Invalid verification code",
    );
  });
});
