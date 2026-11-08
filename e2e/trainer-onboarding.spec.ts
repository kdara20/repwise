import { expect, test, type Browser, type Page } from "@playwright/test";

import { makeAdmin, signUpViaApi, signUpViaUi, testEmail, uniqueId } from "./helpers";

/**
 * Phase 1 core flow: sign up → apply → admin approves → trainer edits and
 * publishes → profile is searchable → unpublish hides it again.
 */
test.describe.serial("trainer onboarding", () => {
  const tag = uniqueId();
  // A word only this run's trainer has, so directory search is deterministic.
  const searchWord = `zq${tag}`;
  const name = `Jordan Test ${tag}`;
  const slug = `jordan-${tag}`;

  let applicant: Page;
  let admin: Page;
  let visitor: Page;

  test.beforeAll(async ({ browser, baseURL }) => {
    applicant = await newPage(browser);
    visitor = await newPage(browser);
    admin = await newPage(browser);
    await signUpViaApi(admin.request, baseURL!, `Admin ${tag}`, testEmail("admin"));
    await makeAdmin(admin);
  });

  test.afterAll(async () => {
    await Promise.all([applicant, admin, visitor].map((p) => p?.context().close()));
  });

  test("applicant signs up through the UI", async () => {
    await signUpViaUi(applicant, name, testEmail("applicant"));
    await expect(applicant.getByRole("heading", { name: `Welcome, ${name}` })).toBeVisible();
    await expect(applicant.getByRole("link", { name: "Become a trainer" }).last()).toBeVisible();
  });

  test("application form validates and keeps input", async () => {
    await applicant.goto("/apply");
    await applicant.getByLabel("Headline").fill("Too short");
    await applicant.getByRole("button", { name: "Submit application" }).click();

    await expect(applicant.getByText("Please fix the highlighted fields.")).toBeVisible();
    await expect(applicant.getByText("At least 10 characters")).toBeVisible();
    await expect(applicant.getByText("Pick at least one specialty")).toBeVisible();
    // React resets forms after actions; the echoed values must survive.
    await expect(applicant.getByLabel("Headline")).toHaveValue("Too short");
  });

  test("applicant submits a valid application", async () => {
    await applicant.getByLabel("Headline").fill(`Kettlebell strength coach ${searchWord}`);
    await applicant
      .getByLabel("About you")
      .fill("I help busy parents build real-world strength with simple, sustainable training plans.");
    await applicant.getByLabel("Strength").check();
    await applicant.getByLabel("Mobility").check();
    await applicant.getByLabel("Certifications").fill("CSEP-CPT (2021)");
    await applicant.getByRole("button", { name: "Submit application" }).click();

    await expect(applicant.getByText("Application under review")).toBeVisible();
    await applicant.goto("/dashboard");
    await expect(applicant.getByText("Under review")).toBeVisible();
  });

  test("non-admins cannot open the admin page", async () => {
    await applicant.goto("/admin/applications");
    await expect(applicant.getByRole("heading", { name: "Access denied" })).toBeVisible();
    // No application data may leak to a non-admin.
    await expect(applicant.getByRole("list", { name: "Pending applications" })).toHaveCount(0);
    await expect(applicant.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  });

  test("admin approves the application", async () => {
    await admin.goto("/admin/applications");
    const card = admin.getByRole("listitem").filter({ hasText: name });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: `Approve ${name}` }).click();
    await expect(card).toHaveCount(0);
  });

  test("new trainer is unpublished and not in the directory", async () => {
    await visitor.goto(`/trainers?q=${searchWord}`);
    await expect(visitor.getByText("No trainers match those filters")).toBeVisible();
  });

  test("trainer edits and publishes their profile", async () => {
    await applicant.goto("/studio/profile");
    await expect(applicant.getByRole("heading", { name: "Your trainer profile" })).toBeVisible();
    await applicant.getByLabel("Profile URL").fill(slug);
    await applicant.getByLabel("City").fill("Toronto");
    await applicant.getByLabel("Province / territory").selectOption("ON");
    await applicant.getByLabel("Years coaching").fill("7");
    await applicant.getByLabel("Publish profile").check();
    await applicant.getByRole("button", { name: "Save profile" }).click();
    await expect(applicant.getByText("Saved. Your profile is live.")).toBeVisible();

    // Regression: React's post-action form reset used to blank the province
    // <select>, so a second save without reloading cleared it in the database.
    await expect(applicant.getByLabel("City")).toHaveValue("Toronto");
    await expect(applicant.getByLabel("Province / territory")).toHaveValue("ON");
    await applicant.getByRole("button", { name: "Save profile" }).click();
    await expect(applicant.getByText("Saved. Your profile is live.")).toBeVisible();
    await expect(applicant.getByLabel("Province / territory")).toHaveValue("ON");
  });

  // Filters by province=ON, so this also proves the second save above kept it.
  test("published profile is searchable and has SEO metadata", async () => {
    await visitor.goto(`/trainers?q=${searchWord}&province=ON`);
    const card = visitor.getByRole("link", { name: new RegExp(name) });
    await expect(card).toBeVisible();
    await expect(visitor.getByText("1 trainer matches your search")).toBeVisible();

    await card.click();
    await expect(visitor).toHaveURL(new RegExp(`/trainers/${slug}$`));
    await expect(visitor.getByRole("heading", { level: 1, name })).toBeVisible();
    // Scope to the profile: Next keeps the previous page mounted (hidden) after navigation.
    await expect(visitor.getByRole("article").getByText("Toronto, Ontario")).toBeVisible();
    await expect(visitor).toHaveTitle(`${name} — Personal trainer in Toronto, Ontario · Repwise`);
    await expect(visitor.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/trainers/${slug}$`));
  });

  test("specialty filter excludes non-matching trainers", async () => {
    await visitor.goto(`/trainers?q=${searchWord}&specialty=yoga`);
    await expect(visitor.getByText("No trainers match those filters")).toBeVisible();
  });

  test("unpublishing hides the profile", async () => {
    await applicant.goto("/studio/profile");
    await applicant.getByLabel("Publish profile").uncheck();
    await applicant.getByRole("button", { name: "Save profile" }).click();
    await expect(applicant.getByText("Saved. Your profile is hidden.")).toBeVisible();

    await visitor.goto(`/trainers?q=${searchWord}`);
    await expect(visitor.getByText("No trainers match those filters")).toBeVisible();
    await visitor.goto(`/trainers/${slug}`);
    await expect(visitor.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});

async function newPage(browser: Browser) {
  const context = await browser.newContext();
  return context.newPage();
}
