export interface Project {
	title: string;
	desc: string;
	tags: string[];
	link: string;
	image?: string;
	/** Optional GitHub stats (filled at build/server render time) */
	stars?: number;
	/** Number of forks on GitHub */
	forks?: number;
	/** Canonical repo identifier owner/repo when available */
	repo?: string;
	/**
	 * Optional repository popularity rank.
	 * Originally intended for gitstar-ranking.com (global rank) but if that service
	 * is unreachable, this field is populated with an owner-level star rank
	 * (1 = most starred among the owner's public repos fetched) as a fallback.
	 */
	gitstarRank?: number;
	/** Optional canonical gitstar (or fallback) URL for the repo */
	gitstarUrl?: string;
	/**
	 * Optional. When true, the repo is private on GitHub but the user has
	 * opted it into the public portfolio via `portfolio.md`. Drives the
	 * "private" badge on the card and the project page. See
	 * `.ralph/private-portfolio-candidates.md` and `src/data/portfolio-schema.ts`.
	 */
	private?: boolean;
	/**
	 * Optional sort tier for the card grid. `featured` cards sort first,
	 * `hidden` cards are excluded from the default view but available via
	 * filter, `normal` is the default. Default applied at consumption time
	 * is `normal` (see `PORTFOLIO_DEFAULT_TIER`).
	 */
	tier?: "featured" | "normal" | "hidden";
}

/**
 * A publication surfaced on the home page in the (now-deprecated)
 * Papers section. The /misc route and the planned /publications
 * route still consume this shape via src/components/PublicationCard.
 *
 * Kept on this file because PublicationCard (@/components/PublicationCard)
 * imports from @/types — the type is reused even after the section
 * was deleted.
 */
export interface Publication {
	title: string;
	venue: string;
	year: number;
	url: string;
	pdfUrl?: string;
	/** Optional citation count (Cited by N) scraped from Google Scholar */
	citations?: number;
}
