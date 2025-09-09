import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../globals.css';

describe('Font Display', () => {
    it('should apply the Noto Serif font to the body', () => {
        const { container } = render(<div />);
        const body = container.ownerDocument.body;

        const computedStyle = window.getComputedStyle(body);
        expect(computedStyle.fontFamily).toContain('Noto Serif');
    });
});
