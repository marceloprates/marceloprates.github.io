/**
 * Tests for WorkGrid.
 *
 * Coverage:
 *   - Renders the StarshipCard callout at the top of the page.
 *   - Renders one card per project when no filter is active.
 *   - Filters by primary: clicking a FilterBar primary emits an
 *     onChange that survives the component boundary (verified
 *     through the FilterBar unit tests; here we focus on the
 *     orchestration).
 *   - Filters by tag (case-insensitive).
 *   - Empty state shows the role=status message when nothing
 *     matches.
 *   - URL sync via router.replace is invoked on filter change;
 *     verified through the FilterBar tests above (the parent
 *     owns the navigation; this grid invokes the handler).
 *
 * The WorkGrid shell is tested at the integration level using
 * `next/navigation` mocks for useRouter + useSearchParams.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let searchParamsValue = new URLSearchParams();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock, replace: replaceMock, refresh: vi.fn() }),
    useSearchParams: () => searchParamsValue,
    usePathname: () => "/work",
}));

import { WorkGrid } from "@/components/work/WorkGrid";
import type { WorkProject } from "@/lib/work-projects";

const PROJECTS: WorkProject[] = [
    {
        repo: "marceloprates/prettymaps",
        title: "prettymaps",
        desc: "Generate beautiful maps from OpenStreetMap data.",
        tags: ["python", "maps", "open-source"],
        link: "https://github.com/marceloprates/prettymaps",
        image: "/images/prettymaps.png",
        primary: "art",
    },
    {
        repo: "marceloprates/easyshader",
        title: "easyshader",
        desc: "A Python DSL for 3D art using signed distance functions.",
        tags: ["python", "sdf", "open-source"],
        link: "https://github.com/marceloprates/easyshader",
        image: "/images/easyshader.png",
        primary: "art",
    },
    {
        repo: "marceloprates/Cosmos",
        title: "Cosmos",
        desc: "An edited, modernized LaTeX edition.",
        tags: ["latex", "open-source"],
        link: "https://github.com/marceloprates/Cosmos",
        image: "/images/cosmos.png",
        primary: "experiments",
    },
    {
        repo: "marceloprates/curatekit",
        title: "curatekit",
        desc: "Personal photo curation system.",
        tags: ["python", "cli", "ml"],
        link: "https://github.com/marceloprates/curatekit",
        image: "/images/curatekit.png",
        primary: "code",
    },
];

function setupSearchParams(qs: Record<string, string> = {}) {
    const params = new URLSearchParams(qs);
    searchParamsValue = params;
}

afterEach(() => {
    cleanup();
    pushMock.mockReset();
    replaceMock.mockReset();
    searchParamsValue = new URLSearchParams();
});

describe("WorkGrid", () => {
    it("renders the StarshipCard featured callout", () => {
        setupSearchParams();
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        // StarshipCard renders a BaseCard with aria-label matching.
        expect(screen.getByLabelText(/view my starship/i)).toBeInTheDocument();
    });

    it("renders one card per project when primary=all", () => {
        setupSearchParams();
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        for (const p of PROJECTS) {
            expect(screen.getAllByRole("link", { name: p.title })[0]).toBeInTheDocument();
        }
    });

    it("filters by primary when URL has ?primary=code", () => {
        setupSearchParams({ primary: "code" });
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        // Only curatekit (primary=code) should be visible.
        expect(screen.getAllByRole("link", { name: "curatekit" })[0]).toBeInTheDocument();
        expect(screen.queryAllByRole("link", { name: "prettymaps" })).toHaveLength(0);
        expect(screen.queryAllByRole("link", { name: "easyshader" })).toHaveLength(0);
        expect(screen.queryAllByRole("link", { name: "Cosmos" })).toHaveLength(0);
    });

    it("filters by tag (case-insensitive)", () => {
        setupSearchParams({ tag: "OPEN-SOURCE" });
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        // 3 of 4 projects have an "open-source" tag — curatekit does not.
        expect(screen.getAllByRole("link", { name: "prettymaps" })[0]).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: "easyshader" })[0]).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: "Cosmos" })[0]).toBeInTheDocument();
        expect(screen.queryAllByRole("link", { name: "curatekit" })).toHaveLength(0);
    });

    it("ANDs primary + tag filters when both are present", () => {
        setupSearchParams({ primary: "art", tag: "open-source" });
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        // Only the two "art" projects with the open-source tag.
        expect(screen.getAllByRole("link", { name: "prettymaps" })[0]).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: "easyshader" })[0]).toBeInTheDocument();
        expect(screen.queryAllByRole("link", { name: "Cosmos" })).toHaveLength(0);
        expect(screen.queryAllByRole("link", { name: "curatekit" })).toHaveLength(0);
    });

    it("shows the empty state when nothing matches", () => {
        setupSearchParams({ primary: "writing" });
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        // No project has primary=writing in this fixture.
        expect(
            screen.getByText(/no projects match these filters/i),
        ).toBeInTheDocument();
    });

    it("updates the URL via router.replace when a filter changes", async () => {
        setupSearchParams();
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        fireEvent.click(screen.getByTestId("primary-toggle-experiments"));
        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith(
                expect.stringMatching(/primary=experiments/),
                { scroll: false },
            );
        });
    });

    it("clears the param when primary=all is reselected", async () => {
        setupSearchParams({ primary: "code" });
        render(<WorkGrid projects={PROJECTS} initial={{ primary: "all", tag: null }} />);
        fireEvent.click(screen.getByTestId("primary-toggle-all"));
        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith("/work", { scroll: false });
        });
    });
});
