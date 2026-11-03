import { describe, expect, it } from "vitest";

const luminance = (hex: string) => {
  const channels = hex.match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? [];
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

const contrast = (foreground: string, background: string) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

describe("Astro Pop order detail palette", () => {
  it("keeps every order-detail foreground/background pairing at WCAG AA contrast", () => {
    const pairs = [
      ["3a2c35", "fff8e5"], // ink on cream
      ["3a2c35", "fff0d2"], // ink on paper
      ["3a2c35", "e1eee8"], // ink on mint header
      ["3a2c35", "f4c55b"], // ink on total yellow
      ["116c70", "fff0d2"], // payment status on paper
      ["fff8e5", "a83f2e"], // quantity badge
    ];

    for (const [foreground, background] of pairs) {
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
