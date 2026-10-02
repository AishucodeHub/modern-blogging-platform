"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Feather, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/lib/supabase/client";
import type { PostWithAuthor } from "@/lib/types/database";
import { format } from "date-fns";

export default function BlogPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      const { data } = await supabase
        .from("posts")
        .select(
          `id, title, slug, excerpt, cover_image_url, read_time_minutes, created_at,
           author:profiles(id, display_name, avatar_url, bio),
           tags:post_tags(tag:tags(id, name, slug))`
        )
        .is("deleted_at", null)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        const formatted = data.map((p: any) => ({
          ...p,
          author: p.author,
          tags: (p.tags || []).map((pt: any) => pt.tag).filter(Boolean),
        }));
        setPosts(formatted);
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-card/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mb-4">
              The Blog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Stories, essays, and ideas from the Inkwell community.
            </p>

            {/* Search */}
            <div className="relative mt-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Feather className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                {search ? "No articles found" : "No articles yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {search
                  ? "Try a different search term."
                  : "Be the first to publish a story on Inkwell."}
              </p>
              <Link href="/register">
                <Button>
                  Start writing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block rounded-xl border border-border bg-card hover:shadow-md transition-all overflow-hidden"
                  >
                    {post.cover_image_url && (
                      <div className="aspect-[16/9] overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      <h2 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author?.avatar_url} alt={post.author?.display_name} />
                            <AvatarFallback className="text-[10px]">
                              {post.author?.display_name?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{post.author?.display_name || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.created_at), "MMM d")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.read_time_minutes}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
