/**
 * Cover-image resolution and slug helpers.
 *
 * Used by `src/lib/content.ts getAllPosts/getAllProjects` to DRY the
 * repeated "pick cover: frontmatter or fall back to <img> in excerpt"
 * branch and the "strip extension + leading YYYY-MM-DD- prefix" trim.
 *
 * Both helpers are PURE (no side effects, no I/O). They're easy to
 * test and easy to reuse if a third listing type ever needs them
 * (e.g. a future talks/ or publications/ type).
 */
export function resolveCoverImage(
    meta: Record<string, unknown>,
    excerptHtml: string,
): string | undefined {
    if (typeof meta.cover === "string" && meta.cover.length > 0) {
        return meta.cover;
    }
    return extractFirstImageUrl(excerptHtml);
}

/**
 * Extract a slug from a markdown filename.
 *
 *   "2024-03-17-ia-no-significa-nada.md"  -> "ia-no-significa-nada"
 *   "easyshader.md"                       -> "easyshader"
 *   "2024-03-11-cosmos---a-sketch-...md"   -> "cosmos---a-sketch-..."
 *
 * Strips:
 *   - `.md` / `.markdown` / `.mdx` extensions (case-insensitive)
 *   - Leading `YYYY-MM-DD-` date prefix (matches Jekyll/Hugo convention)
 */
export function slugFromFilename(filename: string): string {
    return filename
        .replace(/\.mdx?$|\.markdown$/i, "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

/**
 * Extract an `<img src="...">` URL from an HTML excerpt string.
 * Returns undefined if the excerpt is plain text or has no image.
 */
function extractFirstImageUrl(html: string): string | undefined {
    if (!html) return undefined;
    const m = html.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
    return m?.[1] || undefined;
}
