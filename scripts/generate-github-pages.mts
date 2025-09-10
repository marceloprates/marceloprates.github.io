import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
const projectsPath = path.join(process.cwd(), 'src', 'data', 'projects.json');
// Parse as unknown then cast to a conservative Record type to avoid `any`
const projectsRaw = JSON.parse(fs.readFileSync(projectsPath, 'utf8')) as unknown;
const projects: Array<Record<string, unknown>> = Array.isArray(projectsRaw) ? (projectsRaw as Array<Record<string, unknown>>) : [];
import { pathToFileURL } from 'url';
const githubModule = await import(pathToFileURL(path.join(process.cwd(), 'src', 'lib', 'github.ts')).href) as unknown;
const moduleObj = githubModule as Record<string, unknown>;
const maybeGen = moduleObj['generateGitHubProjectPage'];
const generateGitHubProjectPage = typeof maybeGen === 'function' ? (maybeGen as (p: unknown) => Promise<void>) : undefined;

const __filename = fileURLToPath(import.meta.url);
// _dirname kept for potential future use (rename to avoid unused var lint)
const _dirname = dirname(__filename);

async function generateAllGitHubPages() {
    console.log('Generating GitHub project pages...');

    // Filter projects that are GitHub repos
    const githubProjects = projects.filter(p => typeof p.link === 'string' && p.link.includes('github.com'));

    // Generate pages for each GitHub project
    if (typeof generateGitHubProjectPage === 'function') {
        await Promise.all(githubProjects.map(async (project) => {
            try {
                await generateGitHubProjectPage(project);
                console.log(`Generated page for ${project.title}`);
            } catch (error) {
                console.error(`Failed to generate page for ${project.title}:`, error);
            }
        }));
    } else {
        console.error('generateGitHubProjectPage not available from module');
    }

    console.log('Finished generating GitHub project pages');
}

generateAllGitHubPages().catch(console.error);
