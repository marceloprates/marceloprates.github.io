import { fileURLToPath } from 'url';
// dirname imported previously only for potential future use; remove to avoid unused var
// import { dirname } from 'path';
import { projects } from '../src/data/projects.ts';
import { generateGitHubProjectPage } from '../src/lib/github.ts';

// Resolve current filename (kept in case future relative path calculations are needed)
fileURLToPath(import.meta.url);

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
