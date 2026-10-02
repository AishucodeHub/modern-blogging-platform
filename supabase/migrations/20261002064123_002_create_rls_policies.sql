/*
# Blog Platform — RLS Policies

## Overview
Adds row-level security policies to all blog tables.

## Security
- Profiles: public read, authenticated insert/update own.
- Posts: public read published+non-deleted; authors read own drafts; authors CRUD own posts.
- Tags: public read, authenticated insert.
- Post tags: public read; authors manage tags on own posts.
- Comments: public read; authenticated create; users edit/delete own; post authors can pin/delete any comment on their posts.
- Likes: public read; authenticated like/unlike own.
*/

-- profiles
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- tags
DROP POLICY IF EXISTS "tags_read_all" ON tags;
CREATE POLICY "tags_read_all" ON tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tags_insert_authenticated" ON tags;
CREATE POLICY "tags_insert_authenticated" ON tags FOR INSERT
  TO authenticated WITH CHECK (true);

-- posts: public can read published, non-deleted
DROP POLICY IF EXISTS "posts_read_published" ON posts;
CREATE POLICY "posts_read_published" ON posts FOR SELECT
  TO anon, authenticated USING (deleted_at IS NULL AND status = 'published');

-- posts: authors can read their own (including drafts and deleted)
DROP POLICY IF EXISTS "posts_read_own" ON posts;
CREATE POLICY "posts_read_own" ON posts FOR SELECT
  TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_insert_own" ON posts;
CREATE POLICY "posts_insert_own" ON posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_update_own" ON posts;
CREATE POLICY "posts_update_own" ON posts FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_delete_own" ON posts;
CREATE POLICY "posts_delete_own" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- post_tags: public read
DROP POLICY IF EXISTS "post_tags_read_all" ON post_tags;
CREATE POLICY "post_tags_read_all" ON post_tags FOR SELECT
  TO anon, authenticated USING (true);

-- post_tags: authors can insert tags on own posts
DROP POLICY IF EXISTS "post_tags_insert_own" ON post_tags;
CREATE POLICY "post_tags_insert_own" ON post_tags FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = post_tags.post_id AND posts.author_id = auth.uid())
  );

-- post_tags: authors can delete tags on own posts
DROP POLICY IF EXISTS "post_tags_delete_own" ON post_tags;
CREATE POLICY "post_tags_delete_own" ON post_tags FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = post_tags.post_id AND posts.author_id = auth.uid())
  );

-- comments: public read
DROP POLICY IF EXISTS "comments_read_all" ON comments;
CREATE POLICY "comments_read_all" ON comments FOR SELECT
  TO anon, authenticated USING (true);

-- comments: authenticated users can create
DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- comments: users can edit their own
DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- comments: post authors can pin/unpin any comment on their posts
DROP POLICY IF EXISTS "comments_update_post_author" ON comments;
CREATE POLICY "comments_update_post_author" ON comments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = comments.post_id AND posts.author_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = comments.post_id AND posts.author_id = auth.uid())
  );

-- comments: users can delete their own
DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- comments: post authors can delete any comment on their posts
DROP POLICY IF EXISTS "comments_delete_post_author" ON comments;
CREATE POLICY "comments_delete_post_author" ON comments FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = comments.post_id AND posts.author_id = auth.uid())
  );

-- likes: public read
DROP POLICY IF EXISTS "likes_read_all" ON likes;
CREATE POLICY "likes_read_all" ON likes FOR SELECT
  TO anon, authenticated USING (true);

-- likes: authenticated can insert own
DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own" ON likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- likes: authenticated can delete own
DROP POLICY IF EXISTS "likes_delete_own" ON likes;
CREATE POLICY "likes_delete_own" ON likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
