export interface Profile {
  id: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published";
  read_time_minutes: number;
  views_count: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Like {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface PostWithAuthor extends Post {
  author: Pick<Profile, "id" | "display_name" | "avatar_url" | "bio">;
  tags: Tag[];
  likes_count?: number;
  comments_count?: number;
}

export interface CommentWithAuthor extends Comment {
  author: Pick<Profile, "id" | "display_name" | "avatar_url">;
  replies?: CommentWithAuthor[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
