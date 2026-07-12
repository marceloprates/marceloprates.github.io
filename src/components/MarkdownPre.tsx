/**
 * MarkdownPre — accessible <pre> for react-markdown output.
 *
 * Default react-markdown renders code fences as <pre><code>...</code></pre>
 * which is scrollable but not keyboard-focusable. axe-core flags this as
 * scrollable-region-focusable. Adding tabIndex={0} fixes that.
 *
 * Note on role="region": we previously added role="region" + aria-label
 * for "code block" semantics, but axe flagged landmark-unique on pages
 * with multiple code blocks (all sharing the same label). Per the ARIA
 * spec, regions must have unique accessible names. Rather than derive
 * a unique label per instance (which requires content-inspection and
 * complicates the API), we drop role="region" entirely. The <pre>
 * with tabindex=0 remains keyboard-scrollable; landmark-unique goes
 * away; scrollable-region-focusable stays fixed.
 */
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface MarkdownPreProps extends ComponentPropsWithoutRef<"pre"> {
    children?: ReactNode;
}

export function MarkdownPre({ children, ...props }: MarkdownPreProps) {
    return (
        <pre
            tabIndex={0}
            className="overflow-auto"
            {...props}
        >
            {children}
        </pre>
    );
}
