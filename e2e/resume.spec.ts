import { test, expect } from "@playwright/test";

/**
 * e2e/resume.spec.ts — phase resume-local-fetch-and-pdf-downloads
 * (Track 3 step 3): verify the per-tab Download PDF link is present,
 * correctly labeled, and points at a URL the static server can serve.
 *
 * Each variant tab in the Resume section gets its own download URL
 * (mirrored into public/resumes/ by scripts/generate-pdf-snapshots.ts
 * and gitignored). These tests prove the wiring stays intact across
 * future UI refactors.
 */

test.describe("resume download PDF button", () => {
    test("default (ai) variant has a download link", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });

        // The download link is in the same flex row as the tab bar,
        // so it's visible from the initial render (no tab click needed).
        const downloadAi = page.locator("#resume-download-ai");
        await expect(downloadAi).toBeVisible();

        const href = await downloadAi.getAttribute("href");
        expect(href).toBe("/resumes/ai.pdf");

        const ariaLabel = await downloadAi.getAttribute("aria-label");
        expect(ariaLabel).toBe("Download AI/ML Engineer resume as PDF");

        // download attribute suggests a sensible filename
        const download = await downloadAi.getAttribute("download");
        expect(download).toBe("marceloprates-resume-ai.pdf");
    });

    test("clicking the ds tab updates the download link to /resumes/ds.pdf", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800); // React hydration

        const dsTab = page.locator("#resume-tab-ds");
        await dsTab.click();

        const downloadDs = page.locator("#resume-download-ds");
        await expect(downloadDs).toBeVisible();

        const href = await downloadDs.getAttribute("href");
        expect(href).toBe("/resumes/ds.pdf");

        const ariaLabel = await downloadDs.getAttribute("aria-label");
        expect(ariaLabel).toBe("Download Data Scientist resume as PDF");
    });

    test("clicking the ml tab updates the download link to /resumes/ml.pdf", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800);

        const mlTab = page.locator("#resume-tab-ml");
        await mlTab.click();

        const downloadMl = page.locator("#resume-download-ml");
        await expect(downloadMl).toBeVisible();

        const href = await downloadMl.getAttribute("href");
        expect(href).toBe("/resumes/ml.pdf");

        const ariaLabel = await downloadMl.getAttribute("aria-label");
        expect(ariaLabel).toBe("Download ML Engineer resume as PDF");
    });

    test("the PDF assets actually serve from the dev server", async ({ request }) => {
        // Direct request to /resumes/ai.pdf — proves Next.js serves the
        // file from public/. If public/resumes/ is not built or the
        // file is missing, this fails loudly with 404.
        for (const id of ["ai", "ds", "ml"]) {
            const response = await request.get(`/resumes/${id}.pdf`);
            expect(response.status(), `/resumes/${id}.pdf status`).toBe(200);
            expect(response.headers()["content-type"]).toContain("pdf");
        }
    });
});
