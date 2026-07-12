import { siteConfig } from "@/config/site";
import { AboutSection } from "@/components/AboutSection";

/**
 * About section. Thin wrapper that pulls identity strings from
 * siteConfig.owner and forwards them to the existing AboutSection
 * component (which renders the card with avatar, bio, etc).
 *
 * Naming note: this file exports `About`. The visual primitive
 * `AboutSection` (in @/components) is the actual layout component.
 */
export function About() {
	const { owner } = siteConfig;
	return (
		<AboutSection name={owner.name} role={owner.role} location={owner.location} />
	);
}