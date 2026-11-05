import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Mirrors the backend `PostResponse` DTO. */
export interface Post {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  content: string;
  imageUrl: string | null;
  workoutSessionId: number | null;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors the backend `CommentResponse` DTO. */
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
}

/** Spring Data Page response of `/api/posts`. */
export type PostPage = Page<Post>;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8082/api/posts';

  feed(page = 0, size = 20): Observable<PostPage> {
    return this.http.get<PostPage>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  /** Text-only publish (backend keeps the JSON endpoint for compatibility). */
  create(content: string): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, { content });
  }

  /** Publish with an optional photo; the backend accepts an empty image for text-only. */
  createWithImage(content: string, image: File): Observable<Post> {
    const form = new FormData();
    form.append('content', content);
    form.append('image', image);
    return this.http.post<Post>(this.apiUrl, form);
  }

  like(postId: number): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${this.apiUrl}/${postId}/like`, {});
  }

  comments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`);
  }

  addComment(postId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comments`, { content });
  }
}
