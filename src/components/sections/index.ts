/**
 * Barrel exports for home-page sections.
 *
 * Composition root (src/app/page.tsx) imports from here:
 *   import { Hero, About } from "@/components/sections";
 *
 * As of nav-redesign Phase C (2026-07-12) the home page composition
 * is locked to Hero + About only. The deleted QuickTiles /
 * SelectedProjects / OpenSource / Papers / Resume sections have
 * moved to their own routes under src/app/(content)/ and are
 * imported directly there.
 */

export { Hero } from "./Hero";
export { About } from "./About";
