import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface UserProfile {
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

export interface UserFullProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:8082/api/auth';
  private readonly tokenKey = 'app.auth.token';
  private readonly legacyTokenKey = 'app.session.token';
  private readonly userKey = 'app.user.id';

  // Signals para manejar el estado reactivo del usuario
  private readonly _currentUser = signal<UserProfile | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor() {
    this.loadSession();
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        tap(response => this.saveSession(response))
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.saveSession(response))
      );
  }

  getProfile(): Observable<UserFullProfile> {
    return this.http.get<UserFullProfile>(`${this.apiUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.legacyTokenKey);
    sessionStorage.removeItem(this.legacyTokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
    window.__calistenicDeviceToken = '';
    this._currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) ?? sessionStorage.getItem(this.tokenKey);
  }

  private saveSession(response: AuthResponse): void {
    const safeToken = response.token?.trim();
    if (safeToken) {
      localStorage.setItem(this.tokenKey, safeToken);
      sessionStorage.setItem(this.tokenKey, safeToken);
      localStorage.removeItem(this.legacyTokenKey);
      sessionStorage.removeItem(this.legacyTokenKey);
      window.__calistenicDeviceToken = '';
    }
    const profile: UserProfile = {
      email: response.email,
      name: response.name,
      role: response.role
    };
    localStorage.setItem(this.userKey, JSON.stringify(profile));
    sessionStorage.setItem(this.userKey, JSON.stringify(profile));
    this._currentUser.set(profile);
  }

  private loadSession(): void {
    const token = localStorage.getItem(this.tokenKey) ?? sessionStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey) ?? sessionStorage.getItem(this.userKey);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserProfile;
        this._currentUser.set(user);

        this.getProfile().subscribe({
          next: (profile) => {
            const updatedProfile: UserProfile = {
              email: profile.email,
              name: profile.name,
              role: profile.role
            };
            localStorage.setItem(this.userKey, JSON.stringify(updatedProfile));
            sessionStorage.setItem(this.userKey, JSON.stringify(updatedProfile));
            this._currentUser.set(updatedProfile);
          },
          error: () => this.logout()
        });
      } catch (e) {
        this.logout();
      }
    }
  }
}
