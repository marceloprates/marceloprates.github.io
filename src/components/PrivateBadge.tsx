import React from "react";
import { Lock } from "lucide-react";

/**
 * Small "private" badge used to mark project cards / detail pages whose
 * backing GitHub repo is private but opted-in via `portfolio.md`.
 *
 * Visual: lock icon + "private" text, rendered as a pill. Uses existing
 * design tokens (amber/50 + amber/700 in light, amber/900/30 + amber/200
 * in dark) so it matches the site's accent palette — no new design tokens.
 *
 * Accessibility: `aria-label="Private repository"` makes the badge
 * meaningful to screen readers (the lock icon alone is decorative; the
 * visible text already conveys the meaning, so the aria-label is
 * belt-and-braces). Renders as `<span>` (inline) so it doesn't break the
 * surrounding card's flex/grid layout.
 */
export const PrivateBadge = React.memo(function PrivateBadge({
	className,
}: {
	className?: string;
}) {
	return (
		<span
			role="img"
			aria-label="Private repository"
			title="Private repository (opted in via portfolio.md)"
			className={[
				"inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
				"text-[10px] font-semibold uppercase tracking-wide",
				"bg-amber-100 text-amber-800 ring-1 ring-amber-200/80",
				"dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700/40",
				className ?? "",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<Lock className="w-3 h-3" aria-hidden="true" />
			<span>private</span>
		</span>
	);
});
