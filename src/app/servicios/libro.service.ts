import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Libro } from '../interfaces/libro.interface';

@Injectable({ providedIn: 'root' })
export class LibroService {
  // Asegúrate de que esta URL coincida con tu backend
  private API = 'http://localhost:8000/api/libros';

  constructor(private http: HttpClient) {}

  getLibros(): Observable<Libro[]> {
    return this.http.get<Libro[]>(this.API);
  }

  getLibroById(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.API}/${id}`);
  }

  createLibro(libro: Libro): Observable<Libro> {
    return this.http.post<Libro>(this.API, libro);
  }

  updateLibro(id: number, libro: Libro): Observable<Libro> {
    return this.http.put<Libro>(`${this.API}/${id}`, libro);
  }

  deleteLibro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
