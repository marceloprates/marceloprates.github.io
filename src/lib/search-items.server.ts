/**
 * Search items resolver (server-only).
 *
 * Reads the build-time-generated `public/search-index.json`
 * (produced by `scripts/build-search-index.ts`, wired into
 * `npm run build`). The static export then ships the JSON file
 * as a regular asset at `/search-index.json`, and the runtime
 * resolver fetches (or, in the Server Component, reads from
 * disk) the same shape.
 *
 * Why a build-time artefact:
 *   - The static export puts every page in `out/` once. Without a
 *     JSON sidecar, content changes would only land after a full
 *     `next build`.
 *   - The `npm run build:search-index` script is independent of
 *     `next build`, so content edits (new post / project card)
 *     can refresh the index without re-running the page renderer.
 *
 * The shape returned here is identical to the previous inline
 * construction — SearchPalette's `SearchableItem` type is
 * unchanged.
 */

import fs from "fs";
import path from "path";

import type { SearchableItem } from "@/components/nav/SearchPalette";

const INDEX_PATH = path.join(process.cwd(), "public", "search-index.json");

/**
 * Read the search index from disk. Throws if the JSON is missing
 * — that means `npm run build:search-index` was skipped before
 * `npm run build`, which is now a hard pre-req of `npm run ci:check`.
 */
export function getSearchItems(): SearchableItem[] {
    if (!fs.existsSync(INDEX_PATH)) {
        throw new Error(
            `search-index.json missing at ${INDEX_PATH}; run \`npm run build:search-index\`.`,
        );
    }
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as SearchableItem[];
    return parsed;
}
