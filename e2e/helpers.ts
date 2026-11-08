import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { Client } from "pg";

/** Every E2E user email starts with this, so teardown can find them. */
export const E2E_EMAIL_PREFIX = "e2e+";
export const PASSWORD = "Correct-Horse-42!";

export function uniqueId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function testEmail(label: string): string {
  return `${E2E_EMAIL_PREFIX}${label}-${uniqueId()}@example.com`;
}

export async function withDb<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Signs up through the real Better Auth UI form. */
export async function signUpViaUi(page: Page, name: string, email: string) {
  await page.goto("/auth/sign-up");
  await page.locator("#name").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(PASSWORD);
  const confirm = page.locator("#confirmPassword");
  if (await confirm.count()) await confirm.fill(PASSWORD);
  await page.locator('form button[type="submit"]').first().click();
  await expect(page).toHaveURL(/\/dashboard/);
}

/** Signs up via the auth API; cookies land in the page's browser context. */
export async function signUpViaApi(request: APIRequestContext, baseURL: string, name: string, email: string) {
  const res = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: baseURL },
    data: { name, email, password: PASSWORD },
  });
  expect(res.ok(), await res.text()).toBe(true);
  const body = (await res.json()) as { user: { id: string } };
  return body.user.id;
}

export async function makeAdmin(page: Page) {
  // Visiting the dashboard creates the profile row on first sign-in.
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  const res = await page.request.get("/api/auth/get-session");
  const { user } = (await res.json()) as { user: { id: string } };
  await withDb((db) => db.query("update profiles set is_admin = true where user_id = $1", [user.id]));
  return user.id;
}
