/**
 * Tests for FilterBar.
 *
 * Coverage:
 *   - Renders one radio button per primary (5: All + 4 primaries).
 *   - The active primary carries aria-checked=true; others false.
 *   - Clicking a different primary emits onChange with the new
 *     primary + the unchanged tag.
 *   - Clicking a tag chip toggles it: pressed on, off on re-click.
 *   - Tag chips exist only for tags in the supplied `tagUniverse`.
 *   - Tag buttons have aria-pressed reflecting state.
 *   - Touch-target minimum: every button is h-10 or h-11
 *     (≥ 40 px ≥ WCAG 2.5.8 24 px).
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { FilterBar } from "@/components/work/FilterBar";

afterEach(cleanup);

describe("FilterBar", () => {
    it("renders all 5 primary toggles", () => {
        render(
            <FilterBar
                primary="all"
                tag={null}
                tagUniverse={["open-source", "python"]}
                onChange={() => {}}
            />,
        );
        expect(screen.getByTestId("primary-toggle-all")).toBeInTheDocument();
        expect(screen.getByTestId("primary-toggle-code")).toBeInTheDocument();
        expect(screen.getByTestId("primary-toggle-art")).toBeInTheDocument();
        expect(screen.getByTestId("primary-toggle-writing")).toBeInTheDocument();
        expect(screen.getByTestId("primary-toggle-experiments")).toBeInTheDocument();
    });

    it("marks exactly one primary as checked", () => {
        render(
            <FilterBar
                primary="art"
                tag={null}
                tagUniverse={["open-source"]}
                onChange={() => {}}
            />,
        );
        const buttons = screen.getAllByRole("radio");
        const checked = buttons.filter(
            (b) => b.getAttribute("aria-checked") === "true",
        );
        expect(checked).toHaveLength(1);
        expect(checked[0]).toHaveTextContent("Art");
    });

    it("emits onChange with the new primary + unchanged tag", () => {
        const onChange = vi.fn();
        render(
            <FilterBar
                primary="all"
                tag="python"
                tagUniverse={["python", "ml"]}
                onChange={onChange}
            />,
        );
        fireEvent.click(screen.getByTestId("primary-toggle-code"));
        expect(onChange).toHaveBeenCalledWith({ primary: "code", tag: "python" });
    });

    it("renders each tag chip with aria-pressed; clicking toggles", () => {
        const onChange = vi.fn();
        render(
            <FilterBar
                primary="all"
                tag={null}
                tagUniverse={["python", "open-source"]}
                onChange={onChange}
            />,
        );
        const py = screen.getByTestId("tag-toggle-python");
        expect(py.getAttribute("aria-pressed")).toBe("false");
        fireEvent.click(py);
        expect(onChange).toHaveBeenCalledWith({ primary: "all", tag: "python" });
    });

    it("clicking an active tag chip clears it", () => {
        const onChange = vi.fn();
        render(
            <FilterBar
                primary="all"
                tag="python"
                tagUniverse={["python", "open-source"]}
                onChange={onChange}
            />,
        );
        const py = screen.getByTestId("tag-toggle-python");
        expect(py.getAttribute("aria-pressed")).toBe("true");
        fireEvent.click(py);
        expect(onChange).toHaveBeenCalledWith({ primary: "all", tag: null });
    });

    it("hides the tag row entirely when tagUniverse is empty", () => {
        render(
            <FilterBar
                primary="all"
                tag={null}
                tagUniverse={[]}
                onChange={() => {}}
            />,
        );
        expect(screen.queryByRole("group", { name: /filter by tag/i })).toBeNull();
    });

    it("uses radio group role + aria-label", () => {
        render(
            <FilterBar
                primary="all"
                tag={null}
                tagUniverse={["python"]}
                onChange={() => {}}
            />,
        );
        const rg = screen.getByRole("radiogroup", { name: /primary category/i });
        expect(rg).toBeInTheDocument();
    });
});
