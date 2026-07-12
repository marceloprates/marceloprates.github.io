import { test, expect } from "@playwright/test";

/**
 * Misc + spellcheck-pokedex + /projects listing discoverability.
 *
 * The previous version of this spec covered the QuickTiles bento
 * (Misc, Blog, Speaking tile routing) and SelectedProjects "See
 * all" link. Those tiles were retired in Phase C of the
 * navigation redesign. Kept here are the discoverability surfaces
 * that still live on the home page area:
 *   - /misc renders the registry index.
 *   - /spellcheck-pokedex is reachable from /misc.
 *   - /projects listing renders a single h1 + project cards.
 *
 * The `home → misc / posts / projects flow` describe block was
 * retired — the corresponding tile buttons no longer exist.
 */

test.describe("misc discoverability", () => {
    test("/misc renders >= 1 card from the registry", async ({ page }) => {
        const res = await page.goto("/misc", { waitUntil: "domcontentloaded" });
        expect(res?.status()).toBe(200);
        const h1 = page.locator("h1").first();
        await expect(h1).toHaveText("Misc");
        const cards = page.locator('main a[href="/spellcheck-pokedex"]');
        await expect(cards.first()).toBeVisible();
    });

    test("clicking the spellcheck-pokedex card lands on the promoted URL", async ({ page }) => {
        await page.goto("/misc", { waitUntil: "domcontentloaded" });
        await page.locator('a[href="/spellcheck-pokedex"]').first().click();
        await expect(page).toHaveURL(/\/spellcheck-pokedex\/?$/);
        await expect(page.locator("h1").first()).toContainText(/Pok\xe9?dex/i);
    });

    test("/spellcheck-pokedex loads directly", async ({ page }) => {
        const res = await page.goto("/spellcheck-pokedex", {
            waitUntil: "domcontentloaded",
        });
        expect(res?.status()).toBe(200);
    });
});

test.describe("/projects listing", () => {
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
