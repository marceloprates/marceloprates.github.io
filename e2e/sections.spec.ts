import { test, expect } from "@playwright/test";

/**
 * Sections composition tests (Phase 4.6).
 *
 * Verifies that the home page renders all 7 configured sections
 * in the order declared in src/config/sections.ts. If the
 * composition root in src/app/page.tsx breaks (e.g. a section
 * id typo, wrong import, missing case), these tests fail.
 */

test.describe("home page sections composition (Phase 4.6)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });
		// Wait for any post-hydration renders (resume tabs, etc)
		await page.waitForTimeout(500);
	});

	test("all 7 sections render in expected order", async ({ page }) => {
		const main = page.locator("main");
		await expect(main).toBeVisible();

		// hero: H1 with "Hi, I'm" text
		await expect(
			main.getByRole("heading", { level: 1, name: /Hi, I'm/i }),
		).toBeVisible();

		// quick-tiles: landmark region labeled "Quick links"
		await expect(
			main.getByRole("region", { name: "Quick links" }),
		).toBeVisible();

		// about: H2 "About"
		await expect(
			main.getByRole("heading", { level: 2, name: /^About\b/ }),
		).toBeVisible();

		// selected-projects: H2 "Selected Projects"
		await expect(
			main.locator("#projects").getByRole("heading", { level: 2, name: "Selected Projects" }),
		).toBeVisible();

		// open-source: H2 "Open Source"
		await expect(
			main.locator("#open-source").getByRole("heading", { level: 2, name: "Open Source" }),
		).toBeVisible();

		// papers: H3 "Selected Papers" (Section primitive default heading level)
		await expect(
			main.locator("#papers").getByRole("heading", { level: 3, name: "Selected Papers" }),
		).toBeVisible();

		// resume: H3 "Resume" (Section primitive default heading level)
		await expect(
			main.locator("#resume").getByRole("heading", { level: 3, name: "Resume" }),
		).toBeVisible();
	});

	test("section anchors resolve to actual elements (in-page nav)", async ({ page }) => {
		// The page sections use id="projects", id="open-source", id="papers", id="resume"
		for (const id of ["projects", "open-source", "papers", "resume", "about"]) {
			const anchor = page.locator(`#${id}`);
			await expect(anchor).toBeAttached();
		}
	});

	test("Selected Projects section includes a link to /starship (StarshipCard)", async ({ page }) => {
		const projectsSection = page.locator("#projects");
		await expect(projectsSection).toBeVisible();
		// The StarshipCard renders an anchor to /starship somewhere in the grid.
		const starshipLink = projectsSection.locator('a[href*="/starship"]');
		await expect(starshipLink.first()).toBeVisible();
	});

	test("Open Source section links to owner's GitHub", async ({ page }) => {
		const ossSection = page.locator("#open-source");
		await expect(ossSection).toBeVisible();
		// siteConfig.social.github is the source of truth (no hardcoded URL).
		const ghLink = ossSection.locator('a[href*="github.com/marceloprates"]');
		await expect(ghLink.first()).toBeVisible();
	});

	test("section order matches config (hero → ... → resume)", async ({ page }) => {
		// Verify order by reading the DOM positions of section headings.
		const order: number[] = [];

		const h1 = await page.locator("main h1").first().boundingBox();
		order.push(h1?.y ?? 0);

		const about = await page.locator("#about").boundingBox();
		order.push(about?.y ?? 0);

		const projects = await page.locator("#projects").boundingBox();
		order.push(projects?.y ?? 0);

		const openSource = await page.locator("#open-source").boundingBox();
		order.push(openSource?.y ?? 0);

		const papers = await page.locator("#papers").boundingBox();
		order.push(papers?.y ?? 0);

		const resume = await page.locator("#resume").boundingBox();
		order.push(resume?.y ?? 0);

		// Each y should be greater than the previous (sections appear in order).
		for (let i = 1; i < order.length; i++) {
			expect(order[i]).toBeGreaterThan(order[i - 1]);
		}
	});
});