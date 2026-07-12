import { test, expect } from "@playwright/test";

/**
 * /work page e2e (nav-redesign Phase G).
 *
 * Asserts the faceted grid surface:
 *   - Page renders h1 + filter controls.
 *   - Clicking a primary toggle narrows the visible cards.
 *   - Clicking a tag chip narrows further; second click clears it.
 *   - URL updates with router.replace (?primary=...&tag=...).
 *   - Empty state appears when no project matches.
 */

test.describe("/work grid + filters", () => {
    test("renders the page header and FilterBar controls", async ({ page }) => {
        await page.goto("/work", { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
        // The 5 toggle buttons: All, Code, Art, Writing, Experiments.
        for (const p of ["All", "Code", "Art", "Writing", "Experiments"]) {
            await expect(page.getByTestId(`primary-toggle-${p.toLowerCase()}`)).toBeVisible();
        }
    });

    test("default state (?primary=all) shows every project", async ({ page }) => {
        await page.goto("/work", { waitUntil: "domcontentloaded" });
        // 6 GitHub-sourced projects committed at the time of writing.
        const items = page.getByRole("list", { name: /project cards/i }).locator("> li");
        await expect(items).toHaveCount(6);
    });

    test("?primary=art narrows the grid to art records", async ({ page }) => {
        await page.goto("/work?primary=art", { waitUntil: "domcontentloaded" });
        // Active toggle is marked aria-checked=true.
        await expect(
            page.getByTestId("primary-toggle-art"),
        ).toHaveAttribute("aria-checked", "true");
        // Visible projects: prettymaps, easyshader, TSP-Animation, Turmites.
        await expect(page.getByRole("link", { name: "prettymaps" })).toBeVisible();
        await expect(page.getByRole("link", { name: "easyshader" }).first()).toBeVisible();
        // Cosmos (primary=experiments) is hidden.
        await expect(page.getByRole("link", { name: "Cosmos" })).toHaveCount(0);
    });

    test("clicking a primary writes ?primary=... to the URL", async ({ page }) => {
        await page.goto("/work", { waitUntil: "domcontentloaded" });
        await page.getByTestId("primary-toggle-experiments").click();
        await expect(page).toHaveURL(/primary=experiments/);
    });

    test("clicking an active primary toggles back to no filter", async ({ page }) => {
        await page.goto("/work?primary=art", { waitUntil: "domcontentloaded" });
        await page.getByTestId("primary-toggle-all").click();
        // Without active primary, the URL has no ?primary= param.
        await expect(page).not.toHaveURL(/primary=/);
    });

    test("tag chip click adds ?tag=... to the URL", async ({ page }) => {
        await page.goto("/work", { waitUntil: "domcontentloaded" });
        const tag = page.getByTestId("tag-toggle-open-source");
        await tag.click();
        await expect(page).toHaveURL(/tag=open-source/);
        // Clicking again clears it.
        await tag.click();
        await expect(page).not.toHaveURL(/tag=/);
    });

    test("no project matches → empty state", async ({ page }) => {
        await page.goto("/work?primary=writing", { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("status")).toBeVisible();
    });
});
