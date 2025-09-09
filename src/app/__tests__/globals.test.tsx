import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import '../../globals.css';

describe('Global Styles', () => {
    it('applies the correct font-family to the body', () => {
        const { container } = render(<div>Test Font</div>);
        const body = container.ownerDocument.body;
        expect(window.getComputedStyle(body).fontFamily).toContain('Noto Serif');
    });
});
