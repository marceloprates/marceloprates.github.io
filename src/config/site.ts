import { SiteOwnerSchema, SocialSchema } from "./schema";
import type { SiteOwner, Social } from "./schema";

/**
 * Site owner identity + social links.
 *
 * Single source of truth for any text that references the site owner
 * (hero, about, footer, JSON-LD). Validated at module load against
 * SiteOwnerSchema + SocialSchema — config errors throw at build.
 */

const owner: SiteOwner = SiteOwnerSchema.parse({
	name: "Marcelo de Oliveira Rosa Prates",
	shortName: "Marcelo Prates",
	role: "Software developer, data scientist & generative artist",
	location: "Porto Alegre, Brazil",
	birthDate: "1992-09-09",
});

const social: Social = SocialSchema.parse({
	github: "https://github.com/marceloprates",
	semanticScholar:
		"https://www.semanticscholar.org/author/Marcelo-O.-R.-Prates/144677268",
});

export const siteConfig = {
	owner,
	social,
} as const;

/**
 * Compute integer age in years from a YYYY-MM-DD birthdate string.
 * Pure function; no Date.now() side effects (caller passes `now`).
 */
export function computeAge(birthDate: string, now: Date = new Date()): number {
	const [y, m, d] = birthDate.split("-").map(Number) as [number, number, number];
	const birth = new Date(y, m - 1, d); // month is 0-based in Date
	let years = now.getFullYear() - birth.getFullYear();
	const monthDiff = now.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
		years--;
	}
	return years;
}