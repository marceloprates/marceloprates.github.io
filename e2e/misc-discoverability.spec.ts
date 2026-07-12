import { test, expect } from "@playwright/test";

/**
 * misc-orphan-discoverability loop regression suite.
 *
 * Verifies every wired path that closed an orphan:
 *   - /misc renders the registry index
 *   - /misc/spellcheck-pokedex is reachable from /misc
 *   - QuickTiles 'Misc' reaches /misc (via the tile button)
 *   - QuickTiles 'Blog' reaches /posts (via the tile button)
 *   - QuickTiles 'Speaking' has a href pointing at Semantic Scholar
 *     (click target inspection only — popup behaviour verified separately)
 *   - SelectedProjects 'All' reaches /projects
 *   - /projects has exactly one <h1> with text 'Projects'
 */
test.describe("misc discoverability", () => {
    test("/misc renders >= 1 card from the registry", async ({ page }) => {
        const res = await page.goto("/misc", { waitUntil: "domcontentloaded" });
        expect(res?.status()).toBe(200);
        const h1 = page.locator("h1").first();
        await expect(h1).toHaveText("Misc");
        const cards = page.locator('main a[href^="/misc/"]');
        await expect(cards.first()).toBeVisible();
    });

    test("clicking the spellcheck-pokedex card lands on the existing page", async ({ page }) => {
        await page.goto("/misc", { waitUntil: "domcontentloaded" });
        await page.locator('a[href="/misc/spellcheck-pokedex"]').first().click();
        await expect(page).toHaveURL(/\/misc\/spellcheck-pokedex\/?$/);
        await expect(page.locator("h1").first()).toContainText(/Pok\xe9?dex/i);
    });

    test("/misc/spellcheck-pokedex loads directly", async ({ page }) => {
        const res = await page.goto("/misc/spellcheck-pokedex", {
            waitUntil: "domcontentloaded",
        });
        expect(res?.status()).toBe(200);
    });
});

test.describe("home → misc / posts / projects flow", () => {
    test("'Misc' quick-tile button click reaches /misc", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        // TileButton renders the tile as a div[role=button][aria-label]
        // that triggers window.location.href via JS click handler.
        await page.getByRole("button", { name: "Misc" }).click();
        await expect(page).toHaveURL(/\/misc\/?$/);
        await expect(page.locator("h1").first()).toHaveText("Misc");
    });

    test("'Blog' quick-tile button click reaches /posts", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.getByRole("button", { name: "Blog" }).click();
        await expect(page).toHaveURL(/\/posts\/?$/);
    });

    test("'Speaking' quick-tile has a Semantic Scholar href", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        // Speaking is a div[role=button] + JS click that opens window.open.
        // Verify the configured URL is wired by triggering navigation then
        // checking the captured popup target URL.
        const popupPromise = page.waitForEvent("popup");
        await page.getByRole("button", { name: "Speaking" }).click();
        const popup = await popupPromise;
        await expect(popup).toHaveURL(/semanticscholar\.org/);
        await popup.close();
    });

    test("SelectedProjects 'All' link reaches /projects", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.getByRole("link", { name: /See all projects/i }).click();
        await expect(page).toHaveURL(/\/projects\/?$/);
    });
});

test.describe("/projects listing (restored in iter 6)", () => {
    test("renders with exactly one <h1>Projects</h1>", async ({ page }) => {
        const res = await page.goto("/projects", {
            waitUntil: "domcontentloaded",
        });
        expect(res?.status()).toBe(200);
        const h1s = page.locator("h1");
        await expect(h1s).toHaveCount(1);
        await expect(h1s.first()).toHaveText("Projects");
    });

    test("renders cards for content/projects markdown pages", async ({ page }) => {
        await page.goto("/projects", { waitUntil: "domcontentloaded" });
        const linksToProjectPages = page.locator('main a[href^="/projects/"]');
        await expect(linksToProjectPages.first()).toBeVisible();
    });
});
