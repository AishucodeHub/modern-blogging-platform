"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, FileText, Eye, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const postId = params.id as string;
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/editor/${postId}`);
    }
  }, [user, authLoading, router, postId]);

  useEffect(() => {
    if (!user || !postId) return;
    async function loadPost() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();

      if (data) {
        const p = data as Post;
        if (p.author_id !== user!.id) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setTitle(p.title);
        setExcerpt(p.excerpt);
        setContent(p.content);
        setCoverImageUrl(p.cover_image_url);
        setStatus(p.status);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    loadPost();
  }, [user, postId]);

  const handleSave = async (newStatus: "draft" | "published") => {
    if (!user || !postId) return;
    setError("");

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        cover_image_url: coverImageUrl.trim(),
        status: newStatus,
      })
      .eq("id", postId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/dashboard");
  };

  const handleDelete = async () => {
    if (!postId) return;
    await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", postId);
    router.push("/dashboard");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading editor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center py-20">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
              Story not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This story may have been deleted or you don&apos;t have access.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
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
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Edit story
          </h1>
          <p className="text-muted-foreground mb-8">
            Update your story. Save as draft or publish when ready.
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
              <Input
                id="coverImageUrl"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={() => handleSave("draft")} variant="outline" disabled={saving}>
                <FileText className="mr-2 h-4 w-4" />
                {saving && status === "draft" ? "Saving..." : "Save draft"}
              </Button>
              <Button onClick={() => handleSave("published")} disabled={saving}>
                <Eye className="mr-2 h-4 w-4" />
                {saving && status === "published" ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
