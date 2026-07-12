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
