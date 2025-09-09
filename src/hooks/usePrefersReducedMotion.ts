import { useEffect, useState } from 'react';

export function usePrefersReducedMotion() {
    const [prefers, setPrefers] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = () => setPrefers(Boolean(mq.matches));
        handler();
        // modern API
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }

        // fallback for older browsers
        if (typeof mq.addListener === 'function') {
            // addListener/removeListener use MediaQueryListListener which is (event: MediaQueryListEvent) => void
            const legacyHandler = () => handler();
            mq.addListener(legacyHandler);
            return () => mq.removeListener(legacyHandler);
        }
        return undefined;
    }, []);

    return prefers;
}

export default usePrefersReducedMotion;
