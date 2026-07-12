import { test, expect } from "@playwright/test";

/**
 * /projects page e2e (nav-redesign Phase G + post-loop rename).
 *
 * Asserts the faceted grid surface:
 *   - Page renders h1 + filter controls.
 *   - Clicking a primary toggle narrows the visible cards.
 *   - Clicking a tag chip narrows further; second click clears it.
 *   - URL updates with router.replace (?primary=...&tag=...).
 *   - Empty state appears when no project matches.
 *
 * The URL is /projects (renamed from the original /work in the
 * post-loop consolidation).
 */

test.describe("/projects grid + filters", () => {
    test("renders the page header and FilterBar controls", async ({ page }) => {
        await page.goto("/projects", { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
        // The 5 toggle buttons: All, Code, Art, Writing, Experiments.
        for (const p of ["All", "Code", "Art", "Writing", "Experiments"]) {
            await expect(page.getByTestId(`primary-toggle-${p.toLowerCase()}`)).toBeVisible();
        }
    });

    test("default state shows every project", async ({ page }) => {
        await page.goto("/projects", { waitUntil: "domcontentloaded" });
        // 7 projects: 6 GitHub-sourced + Starship (the supplemental
        // record appended by getWorkProjects).
        const items = page.getByRole("list", { name: /project cards/i }).locator("> li");
        await expect(items).toHaveCount(7);
    });

    test("?primary=art narrows the grid to art records", async ({ page }) => {
        await page.goto("/projects?primary=art", { waitUntil: "domcontentloaded" });
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
        await page.goto("/projects", { waitUntil: "domcontentloaded" });
        await page.getByTestId("primary-toggle-experiments").click();
        await expect(page).toHaveURL(/primary=experiments/);
    });

    test("clicking an active primary toggles back to no filter", async ({ page }) => {
        await page.goto("/projects?primary=art", { waitUntil: "domcontentloaded" });
        await page.getByTestId("primary-toggle-all").click();
        // Without active primary, the URL has no ?primary= param.
        await expect(page).not.toHaveURL(/primary=/);
    });

    test("tag chip click adds ?tag=... to the URL", async ({ page }) => {
        await page.goto("/projects", { waitUntil: "domcontentloaded" });
        const tag = page.getByTestId("tag-toggle-open-source");
        await tag.click();
        await expect(page).toHaveURL(/tag=open-source/);
        // Clicking again clears it.
        await tag.click();
        await expect(page).not.toHaveURL(/tag=/);
    });

    test("no project matches → empty state", async ({ page }) => {
        await page.goto("/projects?primary=writing", { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("status")).toBeVisible();
    });

    test("Starship appears as one of the project cards", async ({ page }) => {
        await page.goto("/projects", { waitUntil: "domcontentloaded" });
        // Use a name lookup that's loose enough to match the link text
        // (the Starship card renders the title in heading + repo + overlay).
        await expect(
            page.getByRole("link", { name: /Starship/ }).first(),
        ).toBeVisible();
    });
});
