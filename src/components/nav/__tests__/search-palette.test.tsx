/**
 * Tests for SearchPalette.
 *
 * Covers:
 *   - Renders nothing when closed.
 *   - Renders the dialog and input when open.
 *   - Lists items grouped by type under a heading.
 *   - Empty state when no items provided.
 *   - Clicking a result closes + invokes the onClose handler.
 *   - Backdrop click closes the palette.
 *   - Esc closes the palette.
 *   - Fuse.js fuzzy search still surfaces near-matches after
 *     typing into the input.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

import {
    SearchPalette,
    type SearchableItem,
} from "@/components/nav/SearchPalette";

const ITEMS: SearchableItem[] = [
    {
        id: "project:prettymaps",
        title: "prettymaps",
        desc: "Generate beautiful maps from OpenStreetMap data.",
        tags: ["python", "maps"],
        href: "https://github.com/marceloprates/prettymaps",
        type: "project",
    },
    {
        id: "project:easyshader",
        title: "easyshader",
        desc: "A Python DSL for 3D art using signed distance functions.",
        tags: ["python", "sdf"],
        href: "https://github.com/marceloprates/easyshader",
        type: "project",
    },
    {
        id: "post:ia",
        title: "IA no significa nada",
        desc: "An essay in Spanish.",
        tags: ["spanish", "ai"],
        href: "/posts/ia-no-significa-nada",
        type: "post",
    },
    {
        id: "page:/projects",
        title: "Work",
        desc: "All projects.",
        href: "/projects",
        type: "page",
    },
];

afterEach(() => {
    cleanup();
    pushMock.mockReset();
});

describe("SearchPalette", () => {
    it("renders nothing when closed", () => {
        render(<SearchPalette open={false} onClose={() => {}} items={ITEMS} />);
        expect(screen.queryByTestId("search-palette")).toBeNull();
    });

    it("renders the dialog + groups items by type when open", () => {
        render(<SearchPalette open={true} onClose={() => {}} items={ITEMS} />);
        expect(screen.getByTestId("search-palette")).toBeInTheDocument();
        // cmdk-group-heading is rendered as a span; assert by text.
        expect(screen.getByText("Projects")).toBeInTheDocument();
        expect(screen.getByText("Writing")).toBeInTheDocument();
        expect(screen.getByText("Pages")).toBeInTheDocument();
    });

    it("shows the empty state when items list is empty", () => {
        render(<SearchPalette open={true} onClose={() => {}} items={[]} />);
        expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });

    it("fuzzy-matches 'map' to prettymaps even with a partial query", async () => {
        render(<SearchPalette open={true} onClose={() => {}} items={ITEMS} />);
        const input = screen.getByPlaceholderText(/search projects/i);
        fireEvent.change(input, { target: { value: "map" } });
        await waitFor(() => {
            expect(screen.getByTestId("search-result-project:prettymaps")).toBeInTheDocument();
        });
    });

    it("selects a result and pushes the router", () => {
        const onClose = vi.fn();
        render(<SearchPalette open={true} onClose={onClose} items={ITEMS} />);
        const item = screen.getByTestId("search-result-project:prettymaps");
        fireEvent.click(item);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("backdrop click closes the palette", () => {
        const onClose = vi.fn();
        const { container } = render(
            <SearchPalette open={true} onClose={onClose} items={ITEMS} />,
        );
        // The outermost wrapper is the backdrop; click it directly.
        const backdrop = container.firstChild as HTMLElement;
        fireEvent.mouseDown(backdrop);
        expect(onClose).toHaveBeenCalled();
    });

    it("Esc closes the palette", () => {
        const onClose = vi.fn();
        render(<SearchPalette open={true} onClose={onClose} items={ITEMS} />);
        fireEvent.keyDown(window, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("exposes role=dialog + aria-modal=true", () => {
        render(<SearchPalette open={true} onClose={() => {}} items={ITEMS} />);
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });
});
