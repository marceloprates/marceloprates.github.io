import { test, expect } from "@playwright/test";

/**
 * Phase 0 smoke test: prove Playwright can reach the running dev
 * server and that the home page renders with the expected identity.
 *
 * Future iterations (Phase 2 a11y, Phase 3 P0) will add real route
 * coverage per the AUDIT.md findings.
 */
test.describe("home page smoke", () => {
    test("loads with HTTP 200", async ({ page }) => {
        const response = await page.goto("/");
        expect(response?.status()).toBe(200);
    });

    test("title contains 'Marcelo'", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/Marcelo/i);
    });

    test("renders <main> landmark", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("main")).toBeVisible();
    });

    test("has a theme toggle", async ({ page }) => {
        await page.goto("/");
        // Phase 2 a11y will assert the toggle is keyboard-accessible.
        // For now: presence-only check.
        await expect(page.getByRole("button", { name: /theme/i })).toBeVisible();
    });
});

test.describe("/posts page (QW-3 regression guard)", () => {
    test("has exactly one <h1> with text 'Posts'", async ({ page }) => {
        await page.goto("/posts");
        const h1s = page.locator("h1");
        await expect(h1s).toHaveCount(1);
        await expect(h1s.first()).toHaveText("Posts");
    });

    test("loads with HTTP 200", async ({ page }) => {
        const response = await page.goto("/posts");
        expect(response?.status()).toBe(200);
    });
});
