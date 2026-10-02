"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Feather, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/lib/supabase/client";
import type { PostWithAuthor } from "@/lib/types/database";
import { format } from "date-fns";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function loadPost() {
      const { data } = await supabase
        .from("posts")
        .select(
          `*, author:profiles(id, display_name, avatar_url, bio), tags:post_tags(tag:tags(id, name, slug))`
        )
        .eq("slug", slug)
        .is("deleted_at", null)
        .maybeSingle();

      if (data) {
        const formatted = {
          ...data,
          author: data.author,
          tags: (data.tags || []).map((pt: any) => pt.tag).filter(Boolean),
        };
        setPost(formatted);

        // Increment view count
        await supabase
          .from("posts")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", data.id);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Feather className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
              Article not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This story may have been removed or never existed.
            </p>
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author?.avatar_url} alt={post.author?.display_name} />
                  <AvatarFallback>
                    {post.author?.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {post.author?.display_name || "Anonymous"}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.created_at), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.read_time_minutes} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Cover image */}
          {post.cover_image_url && (
            <div className="rounded-xl overflow-hidden mb-10 aspect-[16/9] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: post.content || "<p>No content yet.</p>" }}
          />

          {/* Author bio */}
          {post.author?.bio && (
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex items-start gap-4 rounded-xl bg-card border border-border p-6">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage src={post.author?.avatar_url} alt={post.author?.display_name} />
                  <AvatarFallback>
                    {post.author?.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-1">
                    {post.author?.display_name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.author?.bio}
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
