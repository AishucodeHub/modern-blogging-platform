"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, FileText, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export default function EditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/editor");
    }
  }, [user, authLoading, router]);

  const handleSave = async (publishStatus: "draft" | "published") => {
    if (!user) return;
    setError("");

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    setSaving(true);
    setStatus(publishStatus);

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        cover_image_url: coverImageUrl.trim(),
        status: publishStatus,
        author_id: user.id,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (data && tags.trim()) {
      const tagNames = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      for (const tagName of tagNames) {
        const slug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        let tagId = existingTag?.id;

        if (!tagId) {
          const { data: newTag } = await supabase
            .from("tags")
            .insert({ name: tagName, slug })
            .select()
            .maybeSingle();
          tagId = newTag?.id;
        }

        if (tagId && data.id) {
          await supabase.from("post_tags").insert({
            post_id: data.id,
            tag_id: tagId,
          });
        }
      }
    }

    setSaving(false);
    router.push("/dashboard");
  };

  if (authLoading || !user) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Write a new story
          </h1>
          <p className="text-muted-foreground mb-8">
            Craft your story with the editor below. Save as draft or publish when ready.
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
                placeholder="An attention-grabbing title..."
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short summary that appears in the blog feed..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
              <Input
                id="coverImageUrl"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="technology, writing, design"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<p>Write your story here...</p>"
                rows={16}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can write HTML directly. A rich text editor will be added in Step 4.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={() => handleSave("draft")}
                variant="outline"
                disabled={saving}
              >
                <FileText className="mr-2 h-4 w-4" />
                {saving && status === "draft" ? "Saving..." : "Save draft"}
              </Button>
              <Button
                onClick={() => handleSave("published")}
                disabled={saving}
              >
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
