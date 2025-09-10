#!/usr/bin/env node

// Use CommonJS here on purpose; disable the rule that forbids require() style imports
// because this script is executed with node as a simple runnable script.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { projects } = require('../src/data/projects');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generateGitHubProjectPage } = require('../src/lib/github');

async function generateAllGitHubPages() {
    console.log('Generating GitHub project pages...');

    // Filter projects that are GitHub repos
    const githubProjects = projects.filter(p => p.link?.includes('github.com'));

    // Generate pages for each GitHub project
    await Promise.all(githubProjects.map(async (project) => {
        try {
            await generateGitHubProjectPage(project);
            console.log(`Generated page for ${project.title}`);
        } catch (error) {
            console.error(`Failed to generate page for ${project.title}:`, error);
        }
    }));

    console.log('Finished generating GitHub project pages');
}

generateAllGitHubPages().catch(console.error);
