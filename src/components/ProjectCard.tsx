"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Star, GitFork } from 'lucide-react';
import { Project } from '@/types';
import BaseCard from './BaseCard';
import { getProjectLink } from '@/lib/projects';

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = React.memo(function ProjectCard({ project }: ProjectCardProps) {
    const hasDesc = typeof project.desc === 'string' && project.desc.trim().length > 0;
    const hasTags = Array.isArray(project.tags) && project.tags.length > 0;
    const projectLink = getProjectLink(project);
    const isExternalLink = projectLink.startsWith('http');
    // Prefer an explicit GitHub repo link when available; otherwise fall back to projectLink
    const repoHref = project.repo
        ? (project.repo.startsWith('http') ? project.repo : `https://github.com/${project.repo}`)
        : projectLink;

    const router = useRouter();

    // Navigate to projectLink when the card content is activated (mouse click or keyboard),
    // but ignore clicks on inner interactive elements (like the title anchor which points to the repo).
    const handleCardActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
        // If the original event target is (or is inside) an anchor/button, do nothing and let it handle the action
        const target = (e.target as HTMLElement) || null;
        if (target && target.closest && target.closest('a,button')) return;

        if (isExternalLink) {
            // external links open in a new tab
            window.open(projectLink, '_blank', 'noopener,noreferrer');
        } else {
            router.push(projectLink);
        }
    };

    return (
        <BaseCard
            href={projectLink}
            external={isExternalLink}
            overlayAriaLabel={project.title}
            image={project.image ? {
                src: project.image,
                variant: 'right-slashed',
                priority: false
            } : undefined}
            contentClassName="p-0"
            contentInteractive
        >
            {/* Left content over image */}
            <div
                className="p-6 pointer-events-auto"
                // Make the card content keyboard-focusable and activate on Enter/Space
                role="link"
                tabIndex={0}
                onClick={(e) => handleCardActivate(e)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardActivate(e);
                    }
                }}
            >
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-start gap-2 text-lg md:text-xl">
                    <span className="inline-block w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500 group-hover:scale-y-110 transition-transform" />
                    <a
                        href={repoHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-decoration-clone bg-yellow-200/70 dark:bg-yellow-300/30 px-1 py-0.5 -mx-1 rounded-sm transition-colors hover:bg-yellow-300/80 dark:hover:bg-yellow-400/40"
                    >
                        {project.title}
                    </a>
                </h3>
                {hasDesc && (
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        <span className="box-decoration-clone bg-yellow-200/70 dark:bg-yellow-300/30 px-1 py-0.5 -mx-1 rounded-sm">
                            {project.desc}
                        </span>
                    </p>
                )}
                {hasTags && (
                    <div className="flex flex-wrap gap-2">
                        {project.tags.map((t) => (
                            <span
                                key={t}
                                className="text-[11px] uppercase tracking-wide font-medium px-2.5 py-1 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5 text-gray-700 dark:text-gray-300"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
                {/* GitHub stats if available */}
                {(typeof project.stars === 'number' || typeof project.forks === 'number' || typeof project.gitstarRank === 'number') && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-3">
                            {typeof project.stars === 'number' && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="tabular-nums">{project.stars.toLocaleString()}</span>
                                </div>
                            )}
                            {typeof project.forks === 'number' && (
                                <div className="flex items-center gap-1">
                                    <GitFork className="w-4 h-4" />
                                    <span className="tabular-nums">{project.forks.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        {typeof project.gitstarRank === 'number' && project.gitstarRank <= 10000 && (
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <a
                                    href={project.gitstarUrl ?? '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tabular-nums text-sm text-gray-700 dark:text-gray-300 hover:underline"
                                >
                                    Top #{project.gitstarRank.toLocaleString()} repo
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </BaseCard>
    );
});

export default ProjectCard;
