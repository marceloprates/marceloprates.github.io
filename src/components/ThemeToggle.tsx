"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            ) : (
                <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            )}
        </button>
    );
}
