import { test, expect } from "@playwright/test";

/**
 * Sections composition tests (nav-redesign Phase G).
 *
 * Verifies that the home page renders the locked-down composition
 * (Hero + About only). The previous 7-section bento + tile-based
 * layout was retired in Phase C; the deleted sections now live at
 * their own routes (work, about, resume, posts).
 */

test.describe("home page sections composition (nav-redesign)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });
		await page.waitForTimeout(500);
	});

	test("renders the Hero (h1 with intro greeting)", async ({ page }) => {
		const main = page.locator("main");
		await expect(main).toBeVisible();
		await expect(
			main.getByRole("heading", { level: 1, name: /Hi, I'm/i }),
		).toBeVisible();
	});

	test("renders the About section after the Hero", async ({ page }) => {
		const main = page.locator("main");
		await expect(
			main.locator("#about").getByRole("heading", { level: 2, name: /^About\b/ }),
		).toBeVisible();
	});

	test("does NOT render the deleted bento or section anchors", async ({ page }) => {
		for (const id of [
			"#quick-links",
			"#open-source",
			"#papers",
			"#resume-anchor",
			"#selected-projects-anchor",
		]) {
			await expect(page.locator(id)).toHaveCount(0);
		}
	});
});
