/*
# Blog Platform — Triggers & Functions

## Overview
Adds database triggers for:
1. Auto-updating `updated_at` on profiles, posts, comments.
2. Auto-generating unique slugs on post insert.
3. Auto-regenerating slug + read time on post update.
4. Auto-creating a profile row when a new auth user signs up.
*/

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_posts ON posts;
CREATE TRIGGER set_updated_at_posts
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_comments ON comments;
CREATE TRIGGER set_updated_at_comments
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug on INSERT
CREATE OR REPLACE FUNCTION generate_post_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  candidate_slug text;
  counter integer := 0;
BEGIN
  base_slug := slugify(NEW.title);
  candidate_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM posts WHERE slug = candidate_slug AND id IS DISTINCT FROM NEW.id) LOOP
    counter := counter + 1;
    candidate_slug := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := candidate_slug;

  IF NEW.content IS NOT NULL AND NEW.content != '' THEN
    NEW.read_time_minutes := GREATEST(1, ROUND(
      ((char_length(NEW.content) / 5.0) / 200.0)::numeric, 0
    )::integer);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_post_slug ON posts;
CREATE TRIGGER set_post_slug
  BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION generate_post_slug();

-- Update slug + read time on UPDATE
CREATE OR REPLACE FUNCTION update_post_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  candidate_slug text;
  counter integer := 0;
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title THEN
    base_slug := slugify(NEW.title);
    candidate_slug := base_slug;

    WHILE EXISTS (SELECT 1 FROM posts WHERE slug = candidate_slug AND id IS DISTINCT FROM NEW.id) LOOP
      counter := counter + 1;
      candidate_slug := base_slug || '-' || counter::text;
    END LOOP;

    NEW.slug := candidate_slug;
  END IF;

  IF NEW.content IS DISTINCT FROM OLD.content THEN
    IF NEW.content IS NOT NULL AND NEW.content != '' THEN
      NEW.read_time_minutes := GREATEST(1, ROUND(
        ((char_length(NEW.content) / 5.0) / 200.0)::numeric, 0
      )::integer);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_slug_on_change ON posts;
CREATE TRIGGER update_slug_on_change
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_post_slug();

-- Auto-create profile on auth user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
