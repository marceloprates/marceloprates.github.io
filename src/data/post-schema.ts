import { z } from "zod";

/**
 * Zod schema for post markdown frontmatter under `content/posts/`.
 *
 * Loose (`.passthrough()`) because frontmatter is user-edited and may
 * include ad-hoc fields like `original_path`, `categories`, etc.
 * Schema fails closed only on the required fields; extras are preserved
 * unchanged so build-time readers see them too.
 *
 * **Cover contract**:
 *   - Primary:  `cover: <url-or-path>` (relative `/images/...` or absolute `https://...`)
 *   - Fallback: 1st `<img src="...">` extracted from `excerpt:` at build time
 *     (see `src/lib/content.ts` getAllPosts())
 *
 * Mirrors `src/data/project-schema.ts`. Schema is deliberately NOT
 * auto-invoked from the build hot path — calling `.parse()` on every
 * getAllPosts() iteration hurts Next build throughput. Use
 * `PostFrontmatterSchema.parse()` from validation scripts or vitest
 * fixtures explicitly when needed.
 *
 * @example valid post frontmatter
 * ```yaml
 * ---
 * title: "IA não significa nada"
 * date: "2024-03-17"
 * tags: []
 * excerpt: "<img src='https://upload.wikimedia.org/...jpg'>"
 * cover: https://upload.wikimedia.org/...jpg
 * categories: []
 * original_path: "_posts/2024-3-17-IA.md"
 * ---
 * ```
 */
export const PostFrontmatterSchema = z
	.object({
		/** Required. Card title + `[slug]/page.tsx` heading. */
		title: z.string().min(1),
		/** Optional. Plain text or HTML string. If HTML, first `<img src>` is the cover fallback. */
		excerpt: z.string().optional(),
		/** Optional. Primary cover field. URL or path. Empty string = use excerpt fallback. */
		cover: z.string().optional(),
		/** Optional ISO date string. Used for sort + display. */
		date: z.string().optional(),
		/** Optional tag list. Strings only (no nested objects). */
		tags: z.array(z.string()).optional(),
		/** Optional categories list. Strings only. */
		categories: z.array(z.string()).optional(),
		/** Optional original-path marker (preserved for blog-import traceability). */
		original_path: z.string().optional(),
	})
	.passthrough();

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;
