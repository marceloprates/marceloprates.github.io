/**
 * MarkdownPre — accessible <pre> for react-markdown output.
 *
 * Default react-markdown renders code fences as <pre><code>...</code></pre>
 * which is scrollable but not keyboard-focusable. axe-core flags this as
 * scrollable-region-focusable. Adding tabIndex={0} fixes that.
 *
 * Role="region" + aria-label is the canonical a11y wrapper for code blocks.
 */
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface MarkdownPreProps extends ComponentPropsWithoutRef<"pre"> {
    children?: ReactNode;
}

export function MarkdownPre({ children, ...props }: MarkdownPreProps) {
    return (
        <pre
            tabIndex={0}
            role="region"
            aria-label="Code block"
            className="overflow-auto"
            {...props}
        >
            {children}
        </pre>
    );
}
