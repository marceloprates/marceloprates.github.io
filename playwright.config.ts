import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the smoke e2e suite. The dev server is
 * expected to be already running on http://localhost:3000 (per the
 * AGENTS.md contract for this project); we point at it directly
 * with reuseExistingServer so we don't fight a concurrent process.
 *
 * If the dev server is NOT running, Playwright will spawn `npm run dev`
 * itself via the webServer block.
 */
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [["list"], ["html", { open: "never", outputFolder: ".playwright-report" }]],
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
    },
});
