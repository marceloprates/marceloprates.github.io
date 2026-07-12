import { Section } from "@/components/Section";
import { ResumeTabs } from "@/components/resume/ResumeTabs";

/**
 * Resume section. Wraps the Section primitive + ResumeTabs
 * (which renders the tabbed ATS variants of the resume).
 * No props.
 */
export function Resume() {
	return (
		<Section id="resume" title="Resume" gradient="from-pink-500 via-orange-500 to-amber-400">
			<ResumeTabs />
		</Section>
	);
}