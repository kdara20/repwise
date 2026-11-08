import { expect, test } from "@playwright/test";

test.describe("signed-out access", () => {
  for (const path of ["/dashboard", "/apply", "/studio/profile", "/admin/applications"]) {
    test(`${path} redirects to sign-in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });
  }

  test("public pages load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("certified coach");
    await page.getByRole("link", { name: "Find a trainer" }).first().click();
    await expect(page).toHaveURL(/\/trainers$/);
    await expect(page.getByRole("search")).toBeVisible();
  });

  test("unknown trainer slug shows not-found and is noindex", async ({ page }) => {
    // Streams under the prerendered shell, so the status stays 200 (PPR); what
    // matters is the not-found UI and that search engines are told not to index it.
    await page.goto("/trainers/this-trainer-does-not-exist");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  });

  test("garbage search params don't break the directory", async ({ page }) => {
    const res = await page.goto("/trainers?page=-1&province=ZZ&specialty=<script>");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("search")).toBeVisible();
  });
});
