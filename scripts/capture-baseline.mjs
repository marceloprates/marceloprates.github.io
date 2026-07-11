#!/usr/bin/env node
/**
 * scripts/capture-baseline.mjs
 *
 * Re-runs the Playwright + axe-core capture from /tmp/marceloprates-audit/audit.mjs
 * and writes results to .audit/baseline/baseline.json + .audit/baseline/screenshots/.
 *
 * Use this whenever you want to refresh the regression baseline
 * (e.g. before starting Phase 2 a11y sweep, or after any UI refactor).
 *
 * Requirements:
 *   - Dev server running on http://localhost:3000
 *   - Chromium binary in ~/.cache/ms-playwright/
 *
 * Usage:
 *   node scripts/capture-baseline.mjs [label]
 *   # writes to .audit/baseline/{label}.json and .audit/baseline/screenshots-{label}/
 */

import { spawn } from "node:child_process";
import { mkdirSync, existsSync, copyFileSync, readdirSync } from "node:fs";
import path from "node:path";

const label = process.argv[2] ?? "baseline";
const outDir = path.join(process.cwd(), ".audit", "baseline");
const jsonOut = path.join(outDir, `${label}.json`);
const shotsOut = path.join(outDir, `screenshots-${label}`);

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
if (!existsSync(shotsOut)) mkdirSync(shotsOut, { recursive: true });

console.log(`[baseline] label=${label}`);
console.log(`[baseline] json -> ${jsonOut}`);
console.log(`[baseline] screenshots -> ${shotsOut}`);

// The audit.mjs hardcodes OUT_DIR. We copy its output to baseline/ after it runs.
const child = spawn(
    "node",
    ["/tmp/marceloprates-audit/audit.mjs"],
    { stdio: "inherit" }
);

child.on("exit", (code) => {
    if (code !== 0) {
        console.error(`[baseline] audit.mjs exited with code ${code}`);
        process.exit(code ?? 1);
    }
    // Copy the freshly-written audit-report.json + screenshots to baseline/
    const srcJson = path.join(process.cwd(), ".audit", "audit-report.json");
    const srcShots = path.join(process.cwd(), ".audit", "screenshots");
    copyFileSync(srcJson, jsonOut);
    for (const f of readdirSync(srcShots)) {
        copyFileSync(path.join(srcShots, f), path.join(shotsOut, f));
    }
    console.log(`[baseline] wrote ${jsonOut}`);
    console.log(`[baseline] wrote ${readdirSync(shotsOut).length} screenshots`);
});
