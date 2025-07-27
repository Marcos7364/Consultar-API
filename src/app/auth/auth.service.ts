import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RegisterResponse } from '../interfaces/register-response';


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
  register(nombre: string, email: string, password: string): Observable<RegisterResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { 
      nombre, 
      email, 
      password,
      rol: 'usuario' // Por defecto será usuario normal
    };

    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, body, { headers });
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

  /**
   * Verifica si el usuario tiene el rol especificado.
   * Por defecto, comprueba si es 'admin'.
   */
  hasRole(role: string = 'admin'): boolean {
    const userRole = this.getRole();
    return userRole === role;
  }

  logout(): void {
    localStorage.clear();
  }
}
