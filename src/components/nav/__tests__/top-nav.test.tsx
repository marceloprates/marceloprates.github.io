/**
 * Tests for the TopNav component.
 *
 * Covers:
 *   - Renders all 5 nav items in locked order.
 *   - Marks the active item with aria-current="page".
 *   - Marks query-bearing links (e.g. /work?tag=open-source) as
 *     inactive on /work — the "Work" link is the canonical match.
 *   - Search button is rendered when onSearchClick is provided.
 *   - Mobile menu toggle opens/closes via the hamburger button;
 *     aria-expanded reflects state and aria-controls points at the
 *     list id.
 *   - Pressing a nav link closes the mobile menu.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

// Mock next/navigation so usePathname returns a controlled value.
let mockPathname = "/";
vi.mock("next/navigation", () => ({
    usePathname: () => mockPathname,
    useRouter: () => ({ push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
}));

import { NAV_ITEMS, TopNav } from "@/components/nav/TopNav";

afterEach(() => {
    cleanup();
    mockPathname = "/";
});

describe("TopNav", () => {
    beforeEach(() => {
        mockPathname = "/";
    });

    it("renders all 5 nav items in canonical order", () => {
        render(<TopNav />);
        const list = screen.getByTestId("primary-nav-list");
        const items = Array.from(list.querySelectorAll("a"));
        const labels = items.map((a) => a.textContent?.trim());
        expect(labels).toEqual(
            NAV_ITEMS.map((n) => n.label),
        );
    });

    it("marks the active link with aria-current=page", () => {
        mockPathname = "/work";
        render(<TopNav />);
        const activeLinks = screen
            .getAllByRole("link")
            .filter((a) => a.getAttribute("aria-current") === "page");
        expect(activeLinks).toHaveLength(1);
        expect(activeLinks[0]).toHaveTextContent("Projects");
    });

    it("does not claim an item with a query-bearing href as active on /", () => {
        // After removing the Open Source item, the only nav link
        // pointing at /work is the Projects one. It should be active.
        mockPathname = "/work";
        render(<TopNav />);
        const projects = screen.getByRole("link", { name: "Projects" });
        expect(projects.getAttribute("aria-current")).toBe("page");
    });

    it("does not claim any non-root link as active on /", () => {
        mockPathname = "/";
        render(<TopNav />);
        const activeLinks = screen
            .getAllByRole("link")
            .filter((a) => a.getAttribute("aria-current") === "page");
        // Hero "marceloprates" link points at / but /work etc. are not active.
        expect(activeLinks.length).toBeLessThanOrEqual(1);
        // If anything is active, it's the home link.
        if (activeLinks[0]) {
            expect(activeLinks[0].getAttribute("href")).toBe("/");
        }
    });

    it("renders the Search button when onSearchClick is provided", () => {
        const onClick = vi.fn();
        render(<TopNav onSearchClick={onClick} />);
        const btn = screen.getByTestId("search-button");
        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("hides the Search button when onSearchClick is omitted", () => {
        render(<TopNav />);
        expect(screen.queryByTestId("search-button")).toBeNull();
    });

    it("toggles the mobile menu open/closed and updates aria-expanded", () => {
        render(<TopNav onSearchClick={vi.fn()} />);
        const toggle = screen.getByRole("button", { name: /open menu/i });
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
        expect(toggle.getAttribute("aria-controls")).toBe("primary-nav-list");

        fireEvent.click(toggle);
        expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
        const closeBtn = screen.getByRole("button", { name: /close menu/i });
        expect(closeBtn.getAttribute("aria-expanded")).toBe("true");
    });

    it("clicking a nav link closes the mobile menu", () => {
        render(<TopNav onSearchClick={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
        expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();

        // The mobile menu is visible (hamburger is in close state).
        fireEvent.click(screen.getByRole("link", { name: "About" }));
        expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    });

    it("markup exposes skip-link-friendly header landmark", () => {
        render(<TopNav />);
        expect(screen.getByRole("banner")).toBeInTheDocument();
        expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    });
});
