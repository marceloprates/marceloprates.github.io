/**
 * Configuration for GitHub repository handling
 */

interface GitHubConfig {
    /** List of repositories to exclude from auto-generating project pages */
    excludeFromPages: string[];
}

export const githubConfig: GitHubConfig = {
    excludeFromPages: [
        // Add repositories you don't want to auto-generate pages for
        // Format: 'owner/repo'
        'marceloprates/marceloprates.github.io',
    ],
};
