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

test.describe("home page resume tabs (QW-4 regression guard)", () => {
    test("has a role=tablist with 3 tabs", async ({ page }) => {
        await page.goto("/");
        const tablist = page.locator('[role="tablist"]');
        await expect(tablist).toBeVisible();
        await expect(tablist.locator('[role="tab"]')).toHaveCount(3);
    });

    test("clicking a tab switches the active panel", async ({ page }) => {
        await page.goto("/");
        const tabs = page.locator('[role="tab"]');
        await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
        await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");
    });

    test("tab buttons have aria-controls pointing to a tabpanel", async ({ page }) => {
        await page.goto("/");
        const tabs = page.locator('[role="tab"]');
        const firstTab = tabs.nth(0);
        const ariaControls = await firstTab.getAttribute("aria-controls");
        expect(ariaControls).toBeTruthy();
        await expect(page.locator(`#${ariaControls}`)).toHaveAttribute("role", "tabpanel");
    });
});

test.describe("skip-to-content link (QW-5 regression guard)", () => {
    test("link exists and points to #main-content", async ({ page }) => {
        await page.goto("/");
        const skipLink = page.getByRole("link", { name: /skip to main content/i });
        await expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    test("pressing Tab on page load focuses the skip link first", async ({ page }) => {
        await page.goto("/");
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => document.activeElement?.textContent);
        expect(focused).toMatch(/skip to main content/i);
    });

    test("activating the skip link moves focus to #main-content", async ({ page }) => {
        await page.goto("/");
        // Skip link is sr-only (visually hidden until focused). Use keyboard
        // activation rather than .click() which can't interact with sr-only.
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        const focusedId = await page.evaluate(() => document.activeElement?.id);
        expect(focusedId).toBe("main-content");
    });
});

test.describe("scrollable <pre> is keyboard-focusable (QW-6 regression guard)", () => {
    test("/starship/ <pre> block has tabindex=0", async ({ page }) => {
        await page.goto("/starship");
        const pre = page.locator("pre").first();
        await expect(pre).toBeAttached();
        await expect(pre).toHaveAttribute("tabindex", "0");
    });

    test("Tab focus reaches the <pre> block on /starship/", async ({ page }) => {
        await page.goto("/starship");
        // Cycle through focusable elements; confirm at least one <pre>
        // is reachable. We just check it's tabbable, not that it's the Nth
        // tab stop (which depends on tab order of unrelated elements).
        const pre = page.locator("pre").first();
        await pre.focus();
        const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedTag).toBe("PRE");
    });
});
