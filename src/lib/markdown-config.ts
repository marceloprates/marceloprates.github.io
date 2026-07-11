/**
 * Shared markdown plugin configuration for react-markdown.
 *
 * Both /posts/[slug] and /projects/[slug] use the same plugin set.
 * Centralized here so the two pages stay in sync and we can add new
 * plugins (e.g. syntax highlighting) in one place.
 */
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import type { Pluggable, PluggableList } from "unified";

export const defaultRemarkPlugins: PluggableList = [
    remarkMath as unknown as Pluggable,
    remarkGfm as unknown as Pluggable,
];

export const defaultRehypePlugins: PluggableList = [
    rehypeRaw as unknown as Pluggable,
    rehypeKatex as unknown as Pluggable,
];
