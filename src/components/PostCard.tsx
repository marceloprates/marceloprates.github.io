import React from 'react';
import ProjectCard from './ProjectCard';
import type { PostMeta } from '@/data/post-schema';

interface PostCardProps {
    /**
     * Build-time shape from `getAllPosts()` (src/lib/content.ts).
     * Pick selects exactly the fields PostCard renders; PostMeta carries
     * additional fields (cover, categories, original_path) that PostCard
     * doesn't touch. Type-safe — if a future field is required, extend
     * the Pick here.
     */
    post: Pick<PostMeta, 'title' | 'date' | 'excerpt' | 'slug' | 'tags' | 'image'>;
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
