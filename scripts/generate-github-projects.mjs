// Script to fetch all public repos from marceloprates GitHub account
// and generate project entries
import fs from 'fs';
import path from 'path';
import { IGNORE_REPOS } from './ignore-repos.mjs';

function getGithubToken() {
    // Accept multiple env var names because GitHub Actions disallows creating secrets
    // that start with GITHUB_. Allow users to provide GH_TOKEN, GITHUB_PAT, or
    // PERSONAL_TOKEN instead of GITHUB_TOKEN.
    return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT || process.env.PERSONAL_TOKEN;
}

const GITHUB_TOKEN = getGithubToken();

// IGNORE_REPOS imported from shared module

if (!GITHUB_TOKEN) {
    console.error('\n⚠️  No GitHub token found in environment');
    console.error('To avoid rate limiting, set a token in one of these environment variables: GITHUB_TOKEN, GH_TOKEN, GITHUB_PAT, or PERSONAL_TOKEN.');
    console.error('\nIf you created a repository secret with a different name (for example GH_TOKEN), map it to GITHUB_TOKEN in your workflow like so:');
    console.error('\n  env:\n    GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}\n');
    console.error('\nOr set GH_TOKEN (or one of the accepted names) directly in the environment.');
    console.error('You can create a token at https://github.com/settings/tokens (public_repo scope is sufficient).\n');
    process.exit(1);
}

// Utility to handle API rate limits
async function checkRateLimit(response) {
    if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        const rateLimitReset = response.headers.get('x-ratelimit-reset');

        if (rateLimitRemaining === '0' && rateLimitReset) {
            const resetDate = new Date(parseInt(rateLimitReset) * 1000);
            const timeToReset = Math.ceil((resetDate.getTime() - Date.now()) / 1000 / 60);

            throw new Error(
                `GitHub API rate limit exceeded. Limit will reset in ${timeToReset} minutes ` +
                `(at ${resetDate.toLocaleTimeString()})`
            );
        }
    }
    return response;
}

// Utility to retry failed requests
async function fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            await checkRateLimit(response);

            if (response.ok) {
                return response;
            }

            // If we get a 404 or 401, don't retry
            if (response.status === 404 || response.status === 401) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            // Otherwise log the error and retry
            console.error(`Attempt ${i + 1}/${retries} failed: ${response.status} ${response.statusText}`);

            if (i < retries - 1) {
                // Wait 1s, 2s, 4s between retries
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                continue;
            }

            throw new Error(`Failed after ${retries} attempts: ${response.status} ${response.statusText}`);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.error(`Attempt ${i + 1}/${retries} failed:`, error.message);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}

async function fetchAllRepos(username) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_TOKEN}`
    };

    let page = 1;
    let repos = [];

    console.log('Fetching repositories...');

    while (true) {
        const res = await fetchWithRetry(
            `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&type=public&sort=updated`,
            { headers }
        );

        const data = await res.json();
        if (data.length === 0) break;

        repos = repos.concat(data);
        console.log(`Retrieved ${repos.length} repositories...`);
        page++;
    }

    return repos;
}

async function getLanguages(repo) {
    const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_TOKEN}`
    };

    try {
        const res = await fetchWithRetry(repo.languages_url, { headers });
        return res.json();
    } catch (error) {
        console.warn(`Warning: Could not fetch languages for ${repo.name}:`, error.message);
        return {};
    }
}

function shouldExcludeRepo(repo, config) {
    // Check against exclude list (full repo path)
    if (config.excludeFromPages.includes(`${repo.owner.login}/${repo.name}`)) {
        return true;
    }

    // Check against explicit ignore list by repo name or full name
    if (IGNORE_REPOS.includes(repo.name) || IGNORE_REPOS.includes(`${repo.owner.login}/${repo.name}`)) {
        return true;
    }

    // Other exclusion criteria
    return repo.fork || // Skip forks
        repo.archived || // Skip archived repos
        repo.disabled || // Skip disabled repos
        repo.private; // Skip private repos (shouldn't happen with public query but being safe)
}

async function main() {
    try {
        // Load GitHub config
        console.log('Loading configuration...');
        const configPath = path.join(process.cwd(), 'config', 'github.json');
        let config;
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error('Error loading config:', error.message);
            console.error('Using default configuration (no exclusions)');
            config = { excludeFromPages: [] };
        }

        // Fetch all public repos
        const repos = await fetchAllRepos('marceloprates');
        console.log(`\nProcessing ${repos.length} repositories...`);

        // Filter and transform repos to project entries
        const projects = [];
        let processed = 0;

        for (const repo of repos) {
            processed++;
            process.stdout.write(`\rProcessing repo ${processed}/${repos.length}: ${repo.name}`);

            if (shouldExcludeRepo(repo, config)) {
                continue;
            }

            // Get repo languages
            const languages = await getLanguages(repo);
            const langTags = Object.keys(languages)
                .filter(lang => lang) // Remove empty strings
                .slice(0, 5); // Limit to top 5 languages

            // Create project entry
            const project = {
                title: repo.name,
                desc: repo.description || `${repo.name} - A ${langTags[0] || ''} project`,
                tags: langTags,
                link: repo.homepage || repo.html_url,
                repo: `${repo.owner.login}/${repo.name}`,
            };

            // Try to enrich from local content frontmatter (content/projects/<repo>.md)
            try {
                const mdPath = path.join(process.cwd(), 'content', 'projects', `${repo.name}.md`);
                if (fs.existsSync(mdPath)) {
                    const md = fs.readFileSync(mdPath, 'utf8');
                    const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
                    if (fmMatch) {
                        const fm = fmMatch[1];

                        // cover: simple single-line value
                        const coverMatch = fm.match(/(^|\n)cover:\s*(?:['"])?([^\n'"]+)(?:['"])?/);
                        if (coverMatch) {
                            project.image = coverMatch[2].trim();
                        }

                        // excerpt: handle folded block (>-, |-, or single-line)
                        const excerptKeyMatch = fm.match(/(^|\n)excerpt:\s*(.*)/);
                        if (excerptKeyMatch) {
                            const rest = excerptKeyMatch[2].trim();
                            if (rest === '>-' || rest === '|' || rest === '|-' || rest === '>') {
                                // collect indented lines until a non-indented line or end
                                const lines = [];
                                const fmLines = fm.split(/\n/);
                                let start = fmLines.findIndex((l) => l.match(/^excerpt:\s*(>|>\-|\||\|-)?\s*$/));
                                if (start >= 0) {
                                    for (let i = start + 1; i < fmLines.length; i++) {
                                        const l = fmLines[i];
                                        if (/^\s{2,}/.test(l)) {
                                            lines.push(l.replace(/^\s{2}/, ''));
                                        } else {
                                            break;
                                        }
                                    }
                                }
                                if (lines.length) {
                                    // folded block: join lines with space
                                    project.desc = lines.join(' ').replace(/\s+/g, ' ').trim();
                                }
                            } else {
                                // single-line excerpt (possibly quoted)
                                const single = rest.replace(/^['"]|['"]$/g, '');
                                if (single) project.desc = single;
                            }
                        }
                    }
                }
            } catch (err) {
                // Non-fatal; keep generated project as-is
                // console.warn('Could not read project markdown for', repo.name, err.message);
            }

            projects.push(project);
        }

        console.log('\n'); // Clear the processing line

        // Sort projects by stars (will be fetched at build time)
        projects.sort((a, b) => {
            const aName = a.title.toLowerCase();
            const bName = b.title.toLowerCase();
            return aName.localeCompare(bName);
        });

        // Final filter: remove any projects that match IGNORE_REPOS (by name or owner/name)
        const ignoreLower = new Set(IGNORE_REPOS.map((r) => r.toLowerCase()));
        const projectsFiltered = projects.filter((p) => {
            try {
                const name = (p.title || '').toString().toLowerCase();
                const full = (p.repo || '').toString().toLowerCase();
                if (ignoreLower.has(name)) return false;
                if (ignoreLower.has(full)) return false;
                // also check owner/name form if IGNORE_REPOS contains that
                const short = full.split('/').pop() || '';
                if (ignoreLower.has(short)) return false;
            } catch (e) {
                // keep by default on error
            }
            return true;
        });

        // Write to projects data file
        const projectsPath = path.join(process.cwd(), 'src', 'data', 'projects.ts');
        const projectsContent = `// Auto-generated from GitHub repos
import { Project } from '@/types';

export const projects: Project[] = ${JSON.stringify(projectsFiltered, null, 2)};
`;

        fs.writeFileSync(projectsPath, projectsContent);
        console.log(`✨ Success! Wrote ${projectsFiltered.length} project entries to ${projectsPath}`);

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    }
}

main();
