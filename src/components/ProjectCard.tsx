"use client";

import React from 'react';
import { Project } from '@/types';
import BaseCard from './BaseCard';

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = React.memo(function ProjectCard({ project }: ProjectCardProps) {
    const hasDesc = typeof project.desc === 'string' && project.desc.trim().length > 0;
    const hasTags = Array.isArray(project.tags) && project.tags.length > 0;
    return (
        <BaseCard
            href={project.link}
            overlayAriaLabel={project.title}
            image={project.image ? { src: project.image, variant: 'right-slashed', priority: false } : undefined}
            contentClassName="p-0"
        >
            {/* Left content over image */}
            <div className="p-6">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-start gap-2 text-lg md:text-xl">
                    <span className="inline-block w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500 group-hover:scale-y-110 transition-transform" />
                    <span className="box-decoration-clone bg-yellow-200/70 dark:bg-yellow-300/30 px-1 py-0.5 -mx-1 rounded-sm">
                        {project.title}
                    </span>
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
            </div>
        </BaseCard>
    );
});

export default ProjectCard;
