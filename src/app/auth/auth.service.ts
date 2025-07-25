import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';

interface LoginResponse {
  usuario: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body, { headers }).pipe(
      map((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.usuario.id.toString());
        localStorage.setItem('userEmail', response.usuario.email);
        localStorage.setItem('userName', response.usuario.nombre);
        localStorage.setItem('userRole', response.usuario.rol);
        return response;
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  logout(): void {
    localStorage.clear();
  }
}
