/**
 * SkipLink — keyboard-only link that becomes visible when focused.
 *
 * Standard pattern: first focusable element in the body, jumps to
 * the main content region. Helps screen reader and keyboard users
 * bypass nav/decorations.
 *
 * Per WCAG 2.4.1 (Bypass Blocks).
 */
export function SkipLink({ href = "#main-content", label = "Skip to main content" }: { href?: string; label?: string }) {
    return (
        <a
            href={href}
            className="
                sr-only focus:not-sr-only
                focus:fixed focus:top-4 focus:left-4 focus:z-50
                focus:px-4 focus:py-2 focus:rounded-md
                focus:bg-blue-600 focus:text-white focus:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                dark:focus:bg-blue-500
                transition-none
            "
        >
            {label}
        </a>
    );
}
