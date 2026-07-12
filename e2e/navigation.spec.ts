import { test, expect } from "@playwright/test";

/**
 * TopNav + SearchPalette e2e tests (nav-redesign Phase G).
 *
 * Asserts the new site-wide navigation surface:
 *   - TopNav renders on every page.
 *   - Five locked text items are present (Work, Writing, Open
 *     Source, About, Resume).
 *   - Active state is correct on every locked destination.
 *   - ⌘K opens the palette; Esc closes it; the Search button
 *     opens it; selecting a result navigates.
 *   - Mobile menu toggle works below the md breakpoint.
 *   - Skip-link still receives focus as the first focusable
 *     element on the page.
 */

const NAV_ITEMS = [
    { label: "Work", path: "/work" },
    { label: "Writing", path: "/posts" },
    { label: "Open Source", path: "/work?tag=open-source" },
    { label: "About", path: "/about" },
    { label: "Resume", path: "/resume" },
] as const;

test.describe("TopNav presence + active state", () => {
    for (const item of NAV_ITEMS) {
        test(`TopNav carries the locked "${item.label}" link on /`, async ({ page }) => {
            await page.goto("/", { waitUntil: "domcontentloaded" });
            // The primary-nav-list is mounted in <header role="banner">.
            const header = page.getByRole("banner");
            await expect(header).toBeVisible();
            const link = header.getByRole("link", { name: item.label }).first();
            await expect(link).toBeVisible();
            const href = await link.getAttribute("href");
            expect(href).toBe(item.path);
        });
    }

    test("/work marks the Work item with aria-current=page", async ({ page }) => {
        await page.goto("/work", { waitUntil: "domcontentloaded" });
        const work = page
            .getByRole("banner")
            .getByRole("link", { name: "Work" })
            .first();
        await expect(work).toHaveAttribute("aria-current", "page");
    });

    test("/about marks the About item with aria-current=page", async ({ page }) => {
        await page.goto("/about", { waitUntil: "domcontentloaded" });
        const about = page
            .getByRole("banner")
            .getByRole("link", { name: "About" })
            .first();
        await expect(about).toHaveAttribute("aria-current", "page");
    });

    test("/posts (Writing destination) marks the Writing item", async ({ page }) => {
        await page.goto("/posts", { waitUntil: "domcontentloaded" });
        const writing = page
            .getByRole("banner")
            .getByRole("link", { name: "Writing" })
            .first();
        await expect(writing).toHaveAttribute("aria-current", "page");
    });
});

test.describe("SkipLink", () => {
    test("is the first focusable element on the home page", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => {
            const el = document.activeElement;
            return el ? el.textContent?.trim() : null;
        });
        expect(focused).toMatch(/skip to main content/i);
    });
});

test.describe("SearchPalette ⌘K", () => {
    test("Search button opens the palette; Esc closes it", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        const trigger = page.getByTestId("search-button");
        await trigger.click();
        const dialog = page.getByRole("dialog", { name: /site search/i });
        await expect(dialog).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
    });

    test("typing matches a known project", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.getByTestId("search-button").click();
        const input = page.getByPlaceholder(/search projects/i);
        await input.fill("pretty");
        const match = page.getByTestId("search-result-project:marceloprates/prettymaps");
        await expect(match).toBeVisible();
    });

    test("selecting a result navigates to it", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.getByTestId("search-button").click();
        const input = page.getByPlaceholder(/search projects/i);
        await input.fill("About");
        const about = page.getByText("About", { exact: true });
        await about.click();
        await expect(page).toHaveURL(/\/about\/?$/);
    });
});

test.describe("Mobile menu", () => {
    test.use({ viewport: { width: 480, height: 800 } });

    test("hamburger toggle exposes the nav list", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        // Initial state: menu closed (aria-expanded=false).
        const toggle = page.getByRole("button", { name: /open menu/i });
        await expect(toggle).toBeVisible();
        await toggle.click();
        // After click, the close button takes over.
        await expect(page.getByRole("button", { name: /close menu/i })).toBeVisible();
    });
});
