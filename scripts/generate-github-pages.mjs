import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { projects } from '../src/data/projects.ts';
import { generateGitHubProjectPage } from '../src/lib/github.ts';

const __filename = fileURLToPath(import.meta.url);
// __dirname available for potential future use
const __dirname = dirname(__filename);

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
