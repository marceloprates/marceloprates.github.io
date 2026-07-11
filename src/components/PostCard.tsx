import React from 'react';
import ProjectCard from './ProjectCard';

interface PostCardProps {
    post: {
        title: string;
        date?: string;
        excerpt?: string;
        slug: string;
        tags?: string[];
        /**
         * Cover image URL. If provided, rendered by ProjectCard.
         * Sourced from PostMeta.image (extracted at build time by
         * getAllPosts in src/lib/content.ts).
         */
        image?: string;
    };
}

// Thin wrapper that reuses ProjectCard for posts. Maps post shape to project shape.
export const PostCard = React.memo(function PostCard({ post }: PostCardProps) {
    return (
        <ProjectCard
            project={{
                title: post.title,
                desc: post.excerpt || '',
                tags: post.tags || [],
                link: `/posts/${post.slug}`,
                image: post.image,
            }}
        />
    );
});

export default PostCard;
