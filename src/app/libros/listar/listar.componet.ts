import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../servicios/libro.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Libro } from '../../interfaces/libro.interface';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  standalone: true,
  imports: [CommonModule] 
})
export class ListarComponent implements OnInit {
  libros: Libro[] = [];
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private libroService: LibroService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.isLoading = true;
    this.error = '';

    this.libroService.getLibros()
      .pipe(
        catchError(error => {
          console.error('Error:', error);
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
            this.error = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
          } else {
            this.error = 'Error al cargar los libros. Por favor, intente nuevamente.';
          }
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(data => {
        this.libros = data;
      });
  }
}