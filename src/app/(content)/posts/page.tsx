import { getAllPosts } from '@/lib/content';
import PostCard from '@/components/PostCard';
import { ListingPageLayout } from '@/components/ListingPageLayout';

export default function PostsPage() {
    const posts = getAllPosts();

    return (
        <ListingPageLayout
            title="Posts"
            gradient="from-yellow-400 to-orange-500"
        >
            <div className="grid gap-6">
                {posts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
        </ListingPageLayout>
    );
}