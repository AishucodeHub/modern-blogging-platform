/*
# Fix security advisor warnings

## Changes
1. Set `search_path = public` on all helper functions to resolve mutable search_path warnings.
2. Revoke EXECUTE on `handle_new_user()` from anon and authenticated — it's a trigger function
   that should only be called by the trigger, never via the REST API.
*/

-- Fix slugify: add explicit search_path
CREATE OR REPLACE FUNCTION slugify(value text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(value, '[^\w\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

-- Fix update_updated_at_column: add explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix generate_post_slug: add explicit search_path
CREATE OR REPLACE FUNCTION generate_post_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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

-- Fix update_post_slug: add explicit search_path
CREATE OR REPLACE FUNCTION update_post_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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

-- Revoke EXECUTE on handle_new_user from anon and authenticated
-- (it's a trigger-only function, should not be callable via REST)
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;
