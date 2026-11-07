import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SupportReport {
  id: number;
  userId: number;
  userName: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SupportReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  create(title: string, description: string, category: string): Observable<SupportReport> {
    return this.http.post<SupportReport>(this.base, { title, description, category }, { headers: this.headers() });
  }

  mine(): Observable<SupportReport[]> {
    return this.http.get<SupportReport[]>(`${this.base}/mine`, { headers: this.headers() });
  }

  list(status?: string): Observable<SupportReport[]> {
    const url = status ? `${this.base}?status=${status}` : this.base;
    return this.http.get<SupportReport[]>(url, { headers: this.headers() });
  }

  update(id: number, status: string): Observable<SupportReport> {
    return this.http.patch<SupportReport>(`${this.base}/${id}`, { status }, { headers: this.headers() });
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('app.auth.token') ?? sessionStorage.getItem('app.auth.token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
