/**
 * Excerpt sanitization helpers.
 *
 * Used by `src/lib/content.ts getAllPosts/getAllProjects` to strip HTML
 * tags from frontmatter `excerpt:` values BEFORE handing them off to
 * ProjectCard. ProjectCard renders `desc` as plain text (no
 * dangerouslySetInnerHTML), so leaving HTML in place causes literal
 * `<img src='...'>` to display on the card — bad UX.
 *
 * Stripping HTML at extraction time is the chosen path because:
 *   - No DOMPurify dependency
 *   - No `dangerouslySetInnerHTML` surface
 *   - Excerpts are short, plain-text-or-single-img summaries
 *   - The cover `<img>` is already extracted separately via
 *     `extractFirstImageUrl`, so we never lose image content
 *
 * Trade-off: rich formatting (paragraph breaks, bold, links) inside
 * excerpts is collapsed. Acceptable — `desc` was never meant to be a
 * rich-text field; the markdown body on `/posts/[slug]` keeps full
 * formatting.
 */
export function stripHtml(html: string): string {
	if (!html) return "";
	// Strip all HTML tags (greedy across multi-tag lines).
	return html
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}
