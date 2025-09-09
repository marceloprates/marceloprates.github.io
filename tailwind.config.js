/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

const tailwindConfig = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"Hack Nerd Font"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
                nerd: ['"Hack Nerd Font"', 'monospace'],
            },
            colors: {
                brand: {
                    50: '#f2f7ff',
                    100: '#dfeeff',
                    200: '#b9dcff',
                    300: '#83c2ff',
                    400: '#3d9dff',
                    500: '#0a78fa',
                    600: '#005de0',
                    700: '#0049b4',
                    800: '#003f93',
                    900: '#012f68'
                }
            },
            backgroundImage: {
                'grid-radial': 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0, transparent 60%)',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' }
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'fade-in-delayed': 'fadeIn 0.6s ease-out forwards 0.3s',
                'fade-in-delayed-more': 'fadeIn 0.6s ease-out forwards 0.6s',
                shimmer: 'shimmer 6s linear infinite'
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(59,130,246,0.5)',
                'inner-glow': 'inset 0 0 10px rgba(255,255,255,0.05)'
            }
        },
    },
    plugins: [typography],
}

export default tailwindConfig;
