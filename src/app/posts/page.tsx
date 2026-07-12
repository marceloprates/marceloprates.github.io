import { getAllPosts } from '@/lib/content';
import PostCard from '@/components/PostCard';
import { Section } from '@/components/Section';

export default function PostsPage() {
    const posts = getAllPosts();

    return (
        <main className="px-4 py-16 mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Posts</h1>
            <Section id="posts" title="Posts" gradient="from-yellow-400 to-orange-500" as="h2">
                <div className="grid gap-6">
                    {posts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            </Section>
        </main>
    );
}
