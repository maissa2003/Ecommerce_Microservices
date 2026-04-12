import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Article {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
  brand: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  oldPrice?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  // Use gateway base URL for unified routing
  private apiUrl = 'http://localhost:8088/api/articles';

  constructor(private http: HttpClient) {}

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  createArticle(article: Article): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }

  updateArticle(id: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getArticlesByCategory(category: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/category/${category}`);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ url: string }>(`${this.apiUrl}/upload`, formData)
      .pipe(map(response => 'http://localhost:8088' + response.url));
  }
}
