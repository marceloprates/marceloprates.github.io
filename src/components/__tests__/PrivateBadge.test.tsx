import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivateBadge } from "../PrivateBadge";

describe("PrivateBadge", () => {
	it("renders the 'private' text", () => {
		render(<PrivateBadge />);
		expect(screen.getByText("private")).toBeInTheDocument();
	});

	it("has an aria-label for screen readers", () => {
		render(<PrivateBadge />);
		// aria-label is on the badge wrapper; query by accessible name.
		const badge = screen.getByLabelText("Private repository");
		expect(badge).toBeInTheDocument();
	});

	it("renders as a span (inline, not block-level)", () => {
		const { container } = render(<PrivateBadge />);
		const badge = container.querySelector("span[aria-label='Private repository']");
		expect(badge).not.toBeNull();
		expect(badge?.tagName).toBe("SPAN");
	});

	it("renders the lock icon", () => {
		const { container } = render(<PrivateBadge />);
		// lucide-react renders an <svg> for the icon. We don't assert exact
		// size/class (those are implementation details) but at least one SVG
		// must be present.
		const svgs = container.querySelectorAll("svg");
		expect(svgs.length).toBeGreaterThan(0);
	});

	it("merges custom className when provided", () => {
		const { container } = render(<PrivateBadge className="ml-auto mt-1" />);
		const badge = container.querySelector("span[aria-label='Private repository']");
		expect(badge?.className).toMatch(/ml-auto/);
		expect(badge?.className).toMatch(/mt-1/);
	});

	it("includes dark-mode classes (amber tokens)", () => {
		const { container } = render(<PrivateBadge />);
		const badge = container.querySelector("span[aria-label='Private repository']");
		expect(badge?.className).toMatch(/dark:bg-amber/);
		expect(badge?.className).toMatch(/dark:text-amber/);
	});

	it("includes light-mode classes (amber tokens)", () => {
		const { container } = render(<PrivateBadge />);
		const badge = container.querySelector("span[aria-label='Private repository']");
		expect(badge?.className).toMatch(/bg-amber-100/);
		expect(badge?.className).toMatch(/text-amber-800/);
	});
});
