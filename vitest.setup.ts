import "@testing-library/jest-dom/vitest";

// jsdom does not implement ResizeObserver. cmdk@1.1.1 requires it
// for the palette to render. Polyfill with the official
// @juggle/resize-observer-stub via the global API name. Avoid the
// dependency: the spec is minimal so a hand-rolled stub is enough
// for our tests. The full cmdk component tree calls observe() and
// disconnect() on the observer, never reads `contentRect`.
if (typeof globalThis.ResizeObserver === "undefined") {
    class StubResizeObserver {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ResizeObserver = StubResizeObserver;
}

// jsdom does not implement scrollIntoView on Element. cmdk@1.1.1
// calls it during layout effects to scroll the active Command.Item
// into view. Tests don't observe scroll position, so a no-op stub
// is sufficient.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {
        /* no-op for jsdom */
    };
}

// src/lib/projects.ts → getProjectLink reads window.__PROJECT_METADATA__
// to map a GitHub repo to a local /projects/[slug] page. The real
// value is injected by src/app/layout.tsx at runtime; under jsdom we
// give every test a default empty object so reading it is safe.
// Individual tests that need the local-page behaviour can override
// the global before mounting.
if (typeof window !== "undefined") {
    (window as unknown as { __PROJECT_METADATA__?: Record<string, unknown> }).__PROJECT_METADATA__ = {};
}
