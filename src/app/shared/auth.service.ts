import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'http://localhost:8000/api';
  private tokenKey = 'auth_token';
  private userDataKey = 'auth_user';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userDataKey, JSON.stringify(res.usuario));
      })
    );
  }

  logout() {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        localStorage.clear();
        this.router.navigate(['/login']);
      })
    );
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getUser() {
    return JSON.parse(localStorage.getItem(this.userDataKey) || '{}');
  }

  isAdmin(): boolean {
    return this.getUser()?.rol === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
