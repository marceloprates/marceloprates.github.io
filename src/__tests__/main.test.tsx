/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";

/**
 * Smoke test for Phase 0 acceptance gate: prove vitest + jsdom +
 * @testing-library/react are wired correctly. Asserting that <main>
 * renders is the simplest meaningful check that DOM rendering works.
 *
 * A future iteration (Phase 1 QW-3, Phase 3) will add page-level smoke
 * tests for actual route components.
 */
describe("main landmark", () => {
    it("renders a <main> element with content", () => {
        render(
            <main>
                <h1>Smoke test</h1>
            </main>
        );
        const main = screen.getByRole("main");
        expect(main).toBeInTheDocument();
        expect(main).toContainHTML("<h1>Smoke test</h1>");
    });

    it("supports nested main queries", () => {
        render(
            <div>
                <main data-testid="primary">
                    <p>Hello</p>
                </main>
            </div>
        );
        const main = screen.getByTestId("primary");
        expect(main.querySelector("p")).toHaveTextContent("Hello");
    });
});
