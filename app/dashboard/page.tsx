"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, FileText, Plus, Edit, Trash2, ArrowRight, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Post } from "@/lib/types/database";
import { format } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function loadPosts() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });
      setPosts((data as Post[]) || []);
      setLoading(false);
    }
    loadPosts();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const published = posts.filter((p) => p.status === "published" && !p.deleted_at);
  const drafts = posts.filter((p) => p.status === "draft" && !p.deleted_at);
  const totalViews = posts.reduce((sum, p) => sum + p.views_count, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your stories and track their performance.
              </p>
            </div>
            <Link href="/editor">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New story
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Published</span>
              </div>
              <div className="font-serif text-2xl font-bold text-foreground">
                {published.length}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Edit className="h-4 w-4" />
                <span className="text-sm">Drafts</span>
              </div>
              <div className="font-serif text-2xl font-bold text-foreground">
                {drafts.length}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Total views</span>
              </div>
              <div className="font-serif text-2xl font-bold text-foreground">
                {totalViews}
              </div>
            </div>
          </div>

          {/* Posts list */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">
              Your stories
            </h2>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-border">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Feather className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                  No stories yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Write your first story and share it with the world.
                </p>
                <Link href="/editor">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Write your first story
                  </Button>
                </Link>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={post.status === "published" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {post.status}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.read_time_minutes}m
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-serif text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/editor/${post.id}`}>
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this story?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will move the story to trash. This action can be undone later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
