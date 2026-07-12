import { test, expect } from "@playwright/test";

/**
 * posts-cover-image-extraction loop regression suite.
 *
 * Mirrors e2e/cover-image-rendering.spec.ts but for /posts/. Verifies:
 *   - /posts/ renders 200 OK with ≥1 next/image thumbnail
 *   - The IA post's Wikimedia image URL returns 200 OK (proves the
 *     cover contract works for a non-raw.githubusercontent host)
 *   - At least one external image URL returns 200 OK
 *   - A full-page screenshot of the listing is saved to /tmp/posts-listing.png
 *
 * Note: /posts/ has only 1 entry (the IA post). The assertions check
 * `>= 1` to remain valid when more posts are added in the future.
 */
test.describe("posts cover image rendering", () => {
    test("/posts/ renders 200 OK", async ({ page }) => {
        const res = await page.goto("/posts/", { waitUntil: "domcontentloaded" });
        expect(res?.status()).toBe(200);
    });

    test("/posts/ renders ≥1 next/image thumbnail (data-nimg attribute)", async ({ page }) => {
        await page.goto("/posts/", { waitUntil: "domcontentloaded" });
        const nextImageTags = page.locator("img[data-nimg]");
        const count = await nextImageTags.count();
        expect(count).toBeGreaterThanOrEqual(1);
        const firstAlt = await nextImageTags.first().getAttribute("alt");
        expect(firstAlt).not.toBeNull();
    });

    test("the IA post's cover URL (Wikimedia) returns 200 OK", async ({ page, request }) => {
        await page.goto("/posts/", { waitUntil: "domcontentloaded" });
        const srcs = await page.locator("img[data-nimg]").evaluateAll((nodes) =>
            (nodes as HTMLImageElement[]).map((n) => n.getAttribute("src") || ""),
        );
        expect(srcs.length).toBeGreaterThanOrEqual(1);
        const wikimediaSrc = srcs.find((s) => s.includes("upload.wikimedia.org"));
        expect(wikimediaSrc, "expected a Wikimedia cover in DOM").toBeTruthy();
        const res = await request.get(wikimediaSrc!);
        expect(res.status()).toBe(200);
    });

    test("at least one external https:// cover URL returns 200 OK", async ({ page, request }) => {
        await page.goto("/posts/", { waitUntil: "domcontentloaded" });
        const srcs = await page.locator("img[data-nimg]").evaluateAll((nodes) =>
            (nodes as HTMLImageElement[]).map((n) => n.getAttribute("src") || ""),
        );
        const externalSrc = srcs.find((s) => s.startsWith("https://") || s.startsWith("http://"));
        expect(externalSrc, "expected at least one external cover in DOM").toBeTruthy();
        const res = await request.get(externalSrc!);
        expect(res.status()).toBe(200);
    });

    test("/posts/ card shows a non-empty description span (the desc contract)", async ({ page }) => {
        // The IA post's excerpt was HTML-bearing pre-cover-image-extraction;
        // stripHtml collapsed it to empty. After iter 3's content backfill
        // (explicit plain-text excerpt), the card description should be
        // non-empty. This test catches a regression where the backfill is
        // reverted or the stripHtml pipeline is broken.
        await page.goto("/posts/", { waitUntil: "domcontentloaded" });
        const desc = page.locator('main p[class*="line-clamp-3"] span').first();
        await expect(desc).toBeVisible();
        const text = (await desc.innerText()).trim();
        expect(text.length).toBeGreaterThan(0);
    });

    test("saves a full-page screenshot to /tmp/posts-listing.png for manual review", async ({ page }) => {
        await page.goto("/posts/", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {
            // networkidle can hang if external CDNs are slow; fall through.
        });
        await page.screenshot({ path: "/tmp/posts-listing.png", fullPage: true });
        expect(true).toBe(true);
    });
});
