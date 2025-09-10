import { ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { githubConfig } from '../../config/github';

import { AboutSection } from '@/components/AboutSection';
import { ProjectCard } from '@/components/ProjectCard';
import { TileButton } from '@/components/TileButton';
import { projects as rawProjects } from '@/data/projects';
import { selectedProjects } from '@/data/selected-projects';
import { getAllProjects as getAllContentProjects, getProjectBySlug } from '@/lib/content';
import { getProjectMetadata } from '@/lib/project-metadata.server';
import { tiles } from '@/data/tiles';
import { publications as staticPublications } from '@/data/publications';
import type { Publication, Project } from '@/types';
import { Section } from '@/components/Section';
import { PublicationCard } from '@/components/PublicationCard';
import { StarshipCard } from '@/components/StarshipCard';
// import { getAllPosts, PostMeta } from '@/lib/content';
import fs from 'fs';
import path from 'path';
import ThemeToggle from '@/components/ThemeToggle';

export default async function Home() {
  // theme toggle relies on next-themes which is client-side; keep the button client-only
  // fetch recent posts on server (disabled for now)
  // const posts: PostMeta[] = getAllPosts();
  // Fetch LaTeX resume content from external repo (cache and revalidate periodically)
  const resumeExperienceUrl = 'https://raw.githubusercontent.com/marceloprates/Resume/master/src/experience.tex';
  const resumeSkillsUrl = 'https://raw.githubusercontent.com/marceloprates/Resume/master/src/sidebars/page1sidebar.tex';
  let resumeLatex = '';
  let skillsLatex = '';
  try {
    const [resExp, resSkills] = await Promise.all([
      fetch(resumeExperienceUrl, { next: { revalidate: 60 * 60 } }),
      fetch(resumeSkillsUrl, { next: { revalidate: 60 * 60 } }),
    ]);
    resumeLatex = resExp.ok ? await resExp.text() : '';
    skillsLatex = resSkills.ok ? await resSkills.text() : '';
  } catch {
    resumeLatex = '';
    skillsLatex = '';
  }

  // Minimal LaTeX → Markdown converter for common resume constructs
  const convertLatexToMarkdown = (input: string): string => {
    if (!input) return '';
    let md = input;
    // Normalize line endings
    md = md.replace(/\r\n?|\n/g, '\n');
    // Remove comments
    md = md.replace(/(^|\n)\s*%.*(?=\n|$)/g, '$1');
    // Unescape common LaTeX escaped symbols
    md = md.replace(/\\&/g, '&').replace(/\\%/g, '%').replace(/\\_/g, '_').replace(/\\#/g, '#');
    // Sections
    md = md.replace(/\\section\*?\{([^}]+)\}/g, '## $1');
    md = md.replace(/\\subsection\*?\{([^}]+)\}/g, '### $1');
    md = md.replace(/\\subsubsection\*?\{([^}]+)\}/g, '#### $1');
    // Text formatting
    md = md.replace(/\\textbf\{([^}]+)\}|\\bf\{([^}]+)\}|\\bfseries\s*\{?([^}\n]+)\}?/g, (_, a, b, c) => `**${a || b || c}**`);
    md = md.replace(/\\textit\{([^}]+)\}|\\emph\{([^}]+)\}/g, (_, a, b) => `_${a || b}_`);
    // Links
    md = md.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '[$2]($1)');
    md = md.replace(/\\url\{([^}]+)\}/g, '<$1>');
    // Lists
    md = md
      .replace(/\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g, (block) =>
        block
          .replace(/\\begin\{itemize\}|\\end\{itemize\}/g, '')
          .replace(/\n?\s*\\item\s*/g, '\n- ')
      )
      .replace(/\\begin\{enumerate\}[\s\S]*?\\end\{enumerate\}/g, (block) =>
        block
          .replace(/\\begin\{enumerate\}|\\end\{enumerate\}/g, '')
          .replace(/\n?\s*\\item\s*/g, '\n1. ')
      );
    // Line breaks \\ → two-space newline
    md = md.replace(/\\\\/g, '  \n');
    // Strip common layout commands/environments
    md = md
      .replace(/\\begin\{[^}]+\}|\\end\{[^}]+\}/g, '')
      .replace(/\\vspace\*?\{[^}]*\}|\\hfill|\\newpage|\\clearpage|\\centering|\\raggedright|\\small|\\normalsize|\\large|\\Large|\\LARGE|\\huge|\\Huge/g, '');
    // Remove remaining TeX commands like \\something{...} or \\something (allow digits in command, consume first arg)
    md = md.replace(/\\[a-zA-Z][a-zA-Z0-9]*\*?(\{[^}]*\})?/g, (_, grp) => (grp ? grp.slice(1, -1) : ''));
    // Also handle commands followed by a bare word: \\cmd Word -> Word
    md = md.replace(/\\[a-zA-Z][a-zA-Z0-9]*\s+([^\s{}]+)/g, '$1');

    // Remove braces that simply wrap a non-nested segment (e.g., {TensorFlow, Keras})
    md = md.replace(/(^|\s)\{([^{}]+)\}(?=\s|$)/g, '$1$2');

    // Clean up leftover macro names without backslashes such as "accent2Python" or "accent2 AWS"
    md = md.replace(/\baccent\d+\s*/g, '');

    // Remove a leading "Experience" heading, if present, to avoid redundancy and start with the first role
    md = md.replace(/^\s*#{0,4}\s*Experience\s*\n+/i, '');

    // Heuristic: lines that look like "Title{Company}{Dates}{Location}" (leftover multi-arg macros)
    // Convert to: **Title** — Company (Dates) — Location
    md = md.replace(
      /(^|\n)\s*([^\n{}]+?)\{([^{}]+)\}\{([^{}]+)\}\{([^{}]+)\}(?=\s*(\n|$))/g,
      (_, br, title, company, dates, location) => {
        const prefix = br ? `${br}\n------\n\n` : '';
        return `${prefix}**${title.trim()}** — ${company.trim()} (${dates.trim().replace(/\s--\s/g, ' — ')}) — ${location.trim()}`;
      }
    );
    // Fallback for three-part patterns: Title{Company}{Dates}
    md = md.replace(
      /(^|\n)\s*([^\n{}]+?)\{([^{}]+)\}\{([^{}]+)\}(?=\s*(\n|$))/g,
      (_, br, title, company, dates) => {
        const prefix = br ? `${br}\n------\n\n` : '';
        return `${prefix}**${title.trim()}** — ${company.trim()} (${dates.trim().replace(/\s--\s/g, ' — ')})`;
      }
    );
    // Fallback for two-part patterns (common in skills): Category{Items}
    // Convert to: - Category: Items
    md = md.replace(
      /(^|\n)\s*([^\n{}]+?)\{([^{}]+)\}(?=\s*(\n|$))/g,
      (_, br, category, items) => {
        const prefix = br || '\n';
        return `${prefix}- ${category.trim()}: ${items.trim()}`;
      }
    );

    // Normalize double dashes used for date ranges
    md = md.replace(/\s--\s/g, ' — ');
    md = md.replace(/\{\}/g, '').replace(/\{\s+/g, ' ').replace(/\s+\}/g, ' ');
    // Clean excessive blank lines
    md = md.replace(/\n{3,}/g, '\n\n').trim();
    return md;
  };
  const resumeMarkdown = convertLatexToMarkdown(resumeLatex);

  type SkillItem = { name: string; level: number; tag?: string };
  const parseSkillsFromLatex = (input: string): SkillItem[] => {
    if (!input) return [];
    let src = input.replace(/(^|\n)\s*%.*(?=\n|$)/g, '$1');
    // Unescape common LaTeX escaped symbols
    src = src.replace(/\\&/g, '&').replace(/\\%/g, '%').replace(/\\_/g, '_').replace(/\\#/g, '#');
    const out: SkillItem[] = [];
    const clean = (s?: string) => (s ?? '').replace(/\\&/g, '&').replace(/\\%/g, '%').replace(/\\_/g, '_').replace(/\\#/g, '#').replace(/\s{2,}/g, ' ').trim();
    const push = (name?: string, levelRaw?: string | number, tag?: string) => {
      const n = typeof levelRaw === 'string' ? parseInt(levelRaw, 10) : (levelRaw ?? 0);
      if (!name || !Number.isFinite(n)) return;
      out.push({ name: clean(name), level: Math.max(0, n), tag: clean(tag) || undefined });
    };
    // Pattern 1: \cvskill{Name}{Level}{Tag}
    {
      const re = /\\cvskill\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        push(m[1], m[2], m[3]);
      }
      src = src.replace(re, '');
    }
    // Pattern 2: \cvskill{Name}{Level}
    {
      const re = /\\cvskill\{([^}]+)\}\{([^}]+)\}/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        push(m[1], m[2]);
      }
      src = src.replace(re, '');
    }
    // Pattern 3: \skill{Name}{Level}{Tag?}
    {
      const re = /\\skill\{([^}]+)\}\{([^}]+)\}(?:\{([^}]+)\})?/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        push(m[1], m[2], m[3]);
      }
      src = src.replace(re, '');
    }
    // Pattern 4: Plain lines like "Name — 4 (tag)" or "Name: 3" or "- Name - 5 (tag)"
    {
      const re = /(^|\n)\s*[-*]?\s*([^—:\n]+?)\s*[—:-]\s*(\d+)\s*(?:\(([^)]+)\))?(?=\s*(\n|$))/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        push(m[2], m[3], m[4]);
      }
    }
    // Deduplicate by name+tag, keep max level
    const byKey = new Map<string, SkillItem>();
    for (const s of out) {
      const key = `${s.name}__${s.tag ?? ''}`.toLowerCase();
      const prev = byKey.get(key);
      if (!prev || s.level > prev.level) byKey.set(key, s);
    }
    return Array.from(byKey.values());
  };
  const skills = parseSkillsFromLatex(skillsLatex);


  // Fixed number of positions per skill for aligned dot columns
  const MAX_SKILL_DOTS = 8;

  // Color mapping for skill tags (legend). Approximate cerulean with Tailwind sky-500.
  const tagToColorClass = (tag?: string): string => {
    const t = (tag || '').toLowerCase().trim();
    switch (t) {
      case 'coreml':
      case 'cerulean':
        return 'bg-sky-500';
      case 'genai': // vermillion
      case 'vermillion':
        return 'bg-orange-600';
      case 'deploy': // viridian
      case 'viridian':
        return 'bg-emerald-600';
      case 'infra': // saffron
      case 'saffron':
        return 'bg-amber-400';
      case 'python':
        return 'bg-amber-500';
      case 'ml':
      case 'ai':
        return 'bg-rose-500';
      case 'web':
        return 'bg-emerald-500';
      case 'data':
        return 'bg-indigo-500';
      default:
        return 'bg-zinc-400 dark:bg-zinc-500';
    }
  };
  // Compute age on the server for simple static content
  const birthDate = new Date(1992, 8, 9); // 1992-09-09 (month is 0-based)
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }

  // Read publications from the local JSON file generated by fetch-scholar.js
  const fetchPublications = async (max = 9): Promise<Publication[]> => {
    try {
      // Read publications from disk at build time
      const pubsPath = path.join(process.cwd(), 'data', 'publications.scholar.json');
      const raw = fs.readFileSync(pubsPath, 'utf8');
      const data = JSON.parse(raw || '{}');

      // Sort by citation count (highest first) and respect `max` limit
      const rawPubs: unknown[] = Array.isArray(data.publications) ? data.publications : [];

      // Normalize citation counts: prefer citationsUpdated (set by fetch-scholar.js),
      // then googleScholarCitations, then the original semantic scholar `citations`.
      const normalized: Publication[] = rawPubs.map((p: unknown) => {
        const obj = (typeof p === 'object' && p !== null) ? (p as Record<string, unknown>) : {};
        const gs = typeof obj.googleScholarCitations === 'number' ? obj.googleScholarCitations : null;
        const updated = typeof obj.citationsUpdated === 'number'
          ? obj.citationsUpdated
          : (gs ?? (typeof obj.citations === 'number' ? obj.citations : 0));

        // Build a safe Publication object, coercing or defaulting fields when necessary.
        return {
          title: typeof obj.title === 'string' ? obj.title : String(obj.title ?? ''),
          venue: typeof obj.venue === 'string' ? obj.venue : String(obj.venue ?? ''),
          year: typeof obj.year === 'number' ? obj.year : Number(obj.year) || 0,
          url: typeof obj.url === 'string' ? obj.url : String(obj.url ?? ''),
          pdfUrl: typeof obj.pdfUrl === 'string' ? obj.pdfUrl : undefined,
          citations: updated,
        } as Publication;
      });

      const pubs: Publication[] = normalized.sort((a: Publication, b: Publication) => (b.citations || 0) - (a.citations || 0));

      return pubs.slice(0, max);
    } catch {
      return [];
    }
  };

  let publications: Publication[] = [];
  try {
    publications = await fetchPublications();
  } catch {
    publications = [];
  }

  const publicationsToShow = publications.length ? publications : staticPublications;

  // Enrich projects with GitHub stats when link points to github.com
  const parseGithubRepo = (url: string): string | null => {
    try {
      const u = new URL(url, 'https://example.com');
      if (u.hostname.toLowerCase().endsWith('github.com')) {
        // path like /owner/repo or /owner/repo/
        const parts = u.pathname.replace(/^\//, '').split('/').filter(Boolean);
        if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  // small helper: call GH REST API v3 for repo
  const fetchRepo = async (repo: string) => {
    try {
      const token = process.env.GITHUB_TOKEN;
      const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
      if (token) headers.Authorization = `token ${token}`;
      // Use fetch so Next.js can cache/revalidate (server-side)
      const res = await fetch(`https://api.github.com/repos/${repo}`, { headers, next: { revalidate: 60 * 60 } });
      if (!res.ok) return {};
      const j = await res.json();
      return { stars: typeof j.stargazers_count === 'number' ? j.stargazers_count : undefined, forks: typeof j.forks_count === 'number' ? j.forks_count : undefined };
    } catch {
      return {};
    }
  };

  // Fetch gitstar-ranking rank by scraping the HTML (no public JSON API found for repos)
  // Example page: https://gitstar-ranking.com/<owner>/<repo>
  const fetchGitstar = async (repo: string) => {
    try {
      const [owner, name] = repo.split('/');
      if (!owner || !name) return {};
      const url = `https://gitstar-ranking.com/${owner}/${name}`;
      const res = await fetch(url, { next: { revalidate: 60 * 60 } });
      if (!res.ok) return {};
      const html = await res.text();
      // Look for the 'Rank' attribute block: a div with class 'repository_attribute' containing 'Rank'
      // then the following 'repository_value' div with the number.
      const attrRegex = /<div class='repository_attribute[^>]*'>\s*Rank\s*<\/div>\s*<div class='repository_value[^>]*'>\s*([0-9,]+)\s*<\/div>/i;
      const m = attrRegex.exec(html);
      if (m) {
        const rank = parseInt(m[1].replace(/,/g, ''), 10);
        if (Number.isFinite(rank)) return { gitstarRank: rank, gitstarUrl: url };
      }
      return {};
    } catch {
      return {};
    }
  };

  // enrich projects list and track GitHub projects
  const gitHubProjects: Array<{ repo: string; stars?: number; forks?: number; gitstarRank?: number; name: string; description?: string; link: string; topics?: string[] }> = [];

  const projects: Project[] = await Promise.all(
    rawProjects.map(async (p: unknown) => {
      const pObj = p as Project;
      const repo = pObj.repo || parseGithubRepo(pObj.link);
      if (!repo) return ({ ...pObj } as Project);
      const [stats, gsr] = await Promise.all([fetchRepo(repo), fetchGitstar(repo)]);
      console.log(`Enriched project ${pObj.title} with repo ${repo}:`, { stats, gsr });

      // Track GitHub projects for github-projects.json
      gitHubProjects.push({
        repo,
        stars: stats.stars,
        forks: stats.forks,
        gitstarRank: gsr.gitstarRank,
        name: pObj.title,
        description: pObj.desc,
        link: pObj.link,
        topics: pObj.tags
      });

      return { ...pObj, repo, stars: stats.stars, forks: stats.forks, gitstarRank: gsr.gitstarRank, gitstarUrl: gsr.gitstarUrl } as Project;
    })
  );

  // Save GitHub projects data
  const gitHubProjectsPath = path.join(process.cwd(), 'src', 'data', 'github-projects.json');
  try {
    fs.writeFileSync(gitHubProjectsPath, JSON.stringify(gitHubProjects, null, 2));
    console.log('Saved GitHub projects data to:', gitHubProjectsPath);
  } catch (err) {
    console.error('Failed to save GitHub projects data:', err);
  }

  // Resolve server-side project links to local pages when available to avoid
  // hydration mismatches between server and client rendering (client uses
  // window.__PROJECT_METADATA__ to prefer local pages).
  const projectMetadata = getProjectMetadata();
  const projectsFinal: Project[] = projects.map((p) => {
    try {
      if (p.repo && projectMetadata[p.repo]?.hasLocalPage) {
        const slug = projectMetadata[p.repo].slug || p.repo.split('/')[1];
        return { ...p, link: `/projects/${slug}` } as Project;
      }
    } catch (e) {
      // ignore and fallback to original link
    }
    return p;
  });

  return (
    <div className="min-h-screen transition-colors">

      <ThemeToggle />

      <main className="px-4 py-16 mx-auto max-w-7xl">
        {/* Hero */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white libre-baskerville">
            {'>'} Hi, I&apos;m{' '}
            <span className="relative inline-block">
              <span className="bg-yellow-200 dark:bg-yellow-400/60 px-1 rounded-sm z-0 absolute inset-0 -skew-y-2 pointer-events-none" aria-hidden="true">
                <span className="absolute inset-0 opacity-60 mix-blend-multiply bg-gradient-to-br from-transparent via-black/5 to-transparent" />
                <span className="absolute inset-0 opacity-90 mix-blend-multiply bg-[length:40px_40px] bg-[url('data:image/svg+xml;utf8,<svg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grain\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'1.0\' numOctaves=\'3\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23grain)\' opacity=\'0.35\'/></svg>')]" />
              </span>
              <span className="relative z-10 font-extrabold text-gray-900 dark:text-gray-900">Marcelo Prates!</span>
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300 text-justify">
            My name is Marcelo de Oliveira Rosa Prates, I’m a {years}yo software developer and artist based in Porto Alegre, Brazil.
          </p>
        </header>

        {/* Quick tiles navigation */}
        <section aria-label="Quick links" className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[88px] gap-4">
            {tiles.map((tile) => (
              <TileButton key={tile.label} tile={tile} />
            ))}
          </div>
        </section>

        {/* About + details */}
        <AboutSection
          name="Marcelo de Oliveira Rosa Prates"
          role="Software developer, data scientist & generative artist"
          location="Porto Alegre, Brazil"
        />

        {/* Projects */}
        <section id="projects" className="mt-10 mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Selected Projects</h2>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              aria-label="See all projects"
            >
              All <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StarshipCard href="/starship" />
            {/* Render exactly the manually selected projects in the configured order. */}
            {(() => {
              // Load local content projects to allow references to content pages like '/projects/streamlines' or 'streamlines'
              const contentProjects = getAllContentProjects();

              const selectedResolved: Project[] = [];

              for (const entry of selectedProjects) {
                // If entry looks like an owner/repo (contains '/'), try repo first.
                if (entry.includes('/')) {
                  const found = projectsFinal.find((p) => p.repo === entry || (p.link && p.link.includes(entry.split('/')[1])));
                  if (found) {
                    selectedResolved.push(found);
                    continue;
                  }

                  // Repository not found — try treating the last path segment as a local slug
                  const last = entry.split('/').filter(Boolean).pop();
                  if (last) {
                    const contentMatch = contentProjects.find((c) => c.slug.toLowerCase() === last.toLowerCase());
                    if (contentMatch) {
                      const local = getProjectBySlug(contentMatch.slug);
                      if (local) {
                        const meta = local.meta || {};
                        // Resolve an optional image declared in frontmatter. If it's a
                        // bare filename, assume it's stored under /images/projects/{slug}/
                        let imageSrc: string | undefined = undefined;
                        // Prefer an explicit `image` frontmatter field
                        if (meta.image && typeof meta.image === 'string') {
                          const img = meta.image.trim();
                          if (img.startsWith('http') || img.startsWith('/')) imageSrc = img;
                          else imageSrc = `/images/projects/${contentMatch.slug}/${img}`;
                        }
                        // Fallback: allow frontmatter `excerpt` to contain an <img src="..."> tag
                        if (!imageSrc && meta.excerpt && typeof meta.excerpt === 'string') {
                          const m = meta.excerpt.match(/src=["']([^"']+)["']/i);
                          if (m && m[1]) {
                            const img = m[1].trim();
                            if (img.startsWith('http') || img.startsWith('/')) imageSrc = img;
                            else imageSrc = `/images/projects/${contentMatch.slug}/${img}`;
                          }
                        }

                        selectedResolved.push({
                          title: meta.title || contentMatch.slug,
                          desc: (meta.excerpt || meta.description || '').replace(/<[^>]+>/g, '').trim(),
                          tags: meta.tags || [],
                          link: `/projects/${contentMatch.slug}`,
                          repo: meta.repo || undefined,
                          image: imageSrc,
                        });
                        continue;
                      }
                    }
                  }
                }

                // If entry looks like a path '/projects/slug', normalize to slug and try content
                let slug = entry;
                if (slug.startsWith('/projects/')) slug = slug.replace('/projects/', '');
                const contentMatch = contentProjects.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
                if (contentMatch) {
                  const local = getProjectBySlug(contentMatch.slug);
                  if (local) {
                    const meta = local.meta || {};
                    let imageSrc: string | undefined = undefined;
                    // Prefer an explicit `image` frontmatter field
                    if (meta.image && typeof meta.image === 'string') {
                      const img = meta.image.trim();
                      if (img.startsWith('http') || img.startsWith('/')) imageSrc = img;
                      else imageSrc = `/images/projects/${contentMatch.slug}/${img}`;
                    }
                    // Fallback: allow frontmatter `excerpt` to contain an <img src="..."> tag
                    if (!imageSrc && meta.excerpt && typeof meta.excerpt === 'string') {
                      const m = meta.excerpt.match(/src=["']([^"']+)["']/i);
                      if (m && m[1]) {
                        const img = m[1].trim();
                        if (img.startsWith('http') || img.startsWith('/')) imageSrc = img;
                        else imageSrc = `/images/projects/${contentMatch.slug}/${img}`;
                      }
                    }

                    selectedResolved.push({
                      title: meta.title || contentMatch.slug,
                      desc: (meta.excerpt || meta.description || '').replace(/<[^>]+>/g, '').trim(),
                      tags: meta.tags || [],
                      link: `/projects/${contentMatch.slug}`,
                      repo: meta.repo || undefined,
                      image: imageSrc,
                    });
                    continue;
                  }
                }

                // As a last resort, try to match by title in fetched projects
                const byTitle = projectsFinal.find((p) => p.title && p.title.toLowerCase() === entry.toLowerCase());
                if (byTitle) selectedResolved.push(byTitle);
              }

              return selectedResolved.map((p) => <ProjectCard key={p.title} project={p} />);
            })()}
          </div>
        </section>

        {/* Open Source */}
        <section id="open-source" className="mt-6 mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Open Source</h2>
            <a
              href="https://github.com/marceloprates"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              aria-label="See GitHub"
            >
              All on GitHub <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectsFinal
              .filter((p) => p.repo && !githubConfig.excludeFromPages.includes(p.repo!))
              .sort((a, b) => (b.stars || 0) - (a.stars || 0))
              .map((p) => (
                <ProjectCard key={p.title} project={p} />
              ))}
          </div>
        </section>

        {/* Papers */}
        <Section id="papers" title="Selected Papers" gradient="from-emerald-500 via-teal-500 to-cyan-500">
          <div className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicationsToShow.map((pub: Publication) => (
                <PublicationCard key={pub.title} publication={pub} />
              ))}
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-600 dark:text-gray-300">
            More on{' '}
            <a
              href="https://www.semanticscholar.org/author/Marcelo-O.-R.-Prates/144677268"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Semantic Scholar
            </a>
            .
          </p>
        </Section>

        {/* Resume */}
        <Section id="resume" title="Resume" gradient="from-pink-500 via-orange-500 to-amber-400">
          <div className="mt-4 grid gap-8 md:grid-cols-2 items-start">
            {/* Left column: two stacked cards (Skills on top, Experience below) */}
            <div className="flex flex-col gap-6">
              {/* Skills card */}
              <div className="w-full bg-white ring-1 ring-black/5 rounded-md overflow-hidden">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">Skills (auto-converted from LaTeX)</p>
                    <a
                      href={resumeSkillsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      src/sidebars/page1sidebar.tex
                    </a>
                  </div>
                  <div className="pr-1">
                    <ul className="space-y-1.5">
                      {skills.map((s, idx) => (
                        <li key={`${s.name}-${s.tag ?? ''}-${idx}`} className="flex items-center justify-between gap-2 py-0">
                          <div className="min-w-0">
                            <p className="m-0 text-[13px] leading-[14px] text-gray-900 truncate">
                              {s.name}
                              {s.tag ? <span className="ml-2 text-[10px] leading-none uppercase tracking-wide text-gray-500">{s.tag}</span> : null}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1 w-[140px] justify-end">
                            {Array.from({ length: MAX_SKILL_DOTS }).map((_, i) => (
                              <span
                                key={i}
                                className={`inline-block h-3.5 w-3.5 rounded-full ${i < Math.max(0, Math.min(MAX_SKILL_DOTS, s.level)) ? tagToColorClass(s.tag) : 'bg-zinc-200 dark:bg-zinc-700 opacity-70'}`}
                                aria-hidden="true"
                                title={`${s.name} — ${Math.max(0, Math.min(MAX_SKILL_DOTS, s.level))}${s.tag ? ` (${s.tag})` : ''}`}
                              />
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Experience card */}
              <div className="w-full bg-white ring-1 ring-black/5 rounded-md overflow-hidden">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">Experience (auto-converted from LaTeX)</p>
                    <a
                      href={resumeExperienceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      src/experience.tex
                    </a>
                  </div>
                  <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert max-h-[72vh] overflow-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{resumeMarkdown}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: embedded A4-like PDF viewer */}
            <div className="w-full bg-white/60 dark:bg-zinc-900/40 ring-1 ring-black/5 dark:ring-white/10 rounded-md overflow-hidden">
              <div className="relative w-full aspect-[707/1000]">
                <iframe
                  title="Marcelo Prates Resume"
                  src="https://docs.google.com/viewerng/viewer?url=https://raw.githubusercontent.com/marceloprates/Resume/master/output/latest/cv_latest.pdf&embedded=true"
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div >
  );
}
