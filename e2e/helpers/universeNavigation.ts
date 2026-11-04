import { expect, type Locator, type Page } from "@playwright/test";

export async function openUniverseMobileMenu(page: Page): Promise<Locator> {
  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  const menu = page.getByRole("dialog", { name: "CosmoPort navigation menu" });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await trigger.click();

    if (await menu.isVisible()) {
      return menu;
    }

    await page.waitForTimeout(500);
  }

  await expect(menu).toBeVisible();
  return menu;
}
