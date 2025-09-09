// Lightweight DOM-based toast helper (no React tree required)
// Usage: import { showToast } from '@/components/toast'; showToast('Copied')

export function showToast(message: string, duration = 2000) {
    if (typeof document === 'undefined') return;

    // Ensure a container exists
    const containerId = 'site-toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        Object.assign(container.style, {
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: '9999',
            pointerEvents: 'none',
        });
        document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.textContent = message;
    el.setAttribute('role', 'status');
    Object.assign(el.style, {
        pointerEvents: 'auto',
        background: 'rgba(0,0,0,0.78)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        opacity: '0',
        transform: 'translateY(6px)',
        transition: 'opacity 200ms ease, transform 200ms ease',
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        maxWidth: '320px',
        wordBreak: 'break-word',
    });

    container.appendChild(el);

    // force layout so transition runs
    void el.offsetWidth;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';

    const hide = () => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
            // remove container if empty
            if (container && container.childElementCount === 0 && container.parentNode) container.parentNode.removeChild(container);
        }, 220);
    };

    const timeout = setTimeout(hide, duration);

    // Allow dismiss on click
    el.addEventListener('click', () => {
        clearTimeout(timeout);
        hide();
    });
}
