import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingPageLayout } from "../ListingPageLayout";

describe("ListingPageLayout", () => {
    const renderLayout = (props: Partial<React.ComponentProps<typeof ListingPageLayout>> = {}) =>
        render(
            <ListingPageLayout title="Posts" {...props}>
                <div data-testid="child">child content</div>
            </ListingPageLayout>,
        );

    it("renders exactly one <h1> with the title", () => {
        renderLayout({ title: "Posts" });
        const h1s = screen.getAllByRole("heading", { level: 1 });
        expect(h1s).toHaveLength(1);
        expect(h1s[0]).toHaveTextContent("Posts");
    });

    it("renders an inner <h2> via Section primitive (as='h2')", () => {
        renderLayout({ title: "Projects" });
        const h2s = screen.getAllByRole("heading", { level: 2 });
        // Two h2s: <h2> from Section primitive AND the Section's own wrapping.
        // The primitive wraps <h2> as="h2" so we expect at least one.
        expect(h2s.length).toBeGreaterThanOrEqual(1);
        expect(h2s.some((h) => h.textContent === "Projects")).toBe(true);
    });

    it("renders optional description as a <p> when provided", () => {
        renderLayout({ description: "All my recent writing." });
        expect(screen.getByText("All my recent writing.")).toBeInTheDocument();
    });

    it("does not render a description <p> when description is omitted", () => {
        renderLayout();
        // No <p> in the lead position. The component should not render an empty <p>.
        const leadParagraphs = document.querySelectorAll("main > p");
        expect(leadParagraphs).toHaveLength(0);
    });

    it("renders children inside the layout", () => {
        renderLayout();
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("uses the supplied gradient on the inner Section", () => {
        const { container } = renderLayout({ gradient: "from-emerald-500 to-cyan-500" });
        const gradientSpan = container.querySelector('[class*="bg-gradient-to-r"]');
        expect(gradientSpan).toBeInTheDocument();
        expect(gradientSpan?.className).toContain("from-emerald-500");
    });

    it("falls back to the default gradient when none provided", () => {
        const { container } = renderLayout();
        const gradientSpan = container.querySelector('[class*="bg-gradient-to-r"]');
        expect(gradientSpan).toBeInTheDocument();
        expect(gradientSpan?.className).toContain("from-blue-500");
    });
});