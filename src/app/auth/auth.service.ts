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
  getUser(): { id: number, email: string, nombre: string, rol: string } | null {
    const id = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const nombre = localStorage.getItem('userName');
    const rol = localStorage.getItem('userRole');
    if (id && email && nombre && rol) {
      return { id: Number(id), email, nombre, rol };
    }
    return null;
  }
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
  deleteAccount(): Observable<any> {
  const userId = this.getUser()?.id;
  return this.http.delete(`${this.apiUrl}/usuarios/${userId}`);
  }
  // Obtener todos los usuarios (solo admin)
getAllUsers(): Observable<any[]> {
  const token = this.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  return this.http.get<any[]>(`${this.apiUrl}/usuarios`, { headers });
}

  // Obtener usuario por id
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/${id}`);
  }


  // Eliminar usuario por id (solo admin)
  deleteUser(id: number): Observable<any> {
  const token = this.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  return this.http.delete(`${this.apiUrl}/usuarios/${id}`, { headers });
}
updateUser(id: number, usuario: any): Observable<any> {
  const token = this.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, usuario, { headers });
}

  // Crear un nuevo usuario
createUser(usuario: any): Observable<any> {
  const token = this.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  return this.http.post<any>(`${this.apiUrl}/usuarios`, usuario, { headers });
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
