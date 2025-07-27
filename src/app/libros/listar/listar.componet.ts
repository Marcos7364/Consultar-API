import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../servicios/libro.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Libro } from '../../interfaces/libro.interface';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./listar.css']
})
export class ListarComponent implements OnInit {
  libros: Libro[] = [];
  error: string = '';
  isLoading: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private libroService: LibroService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAdmin = this.authService.hasRole('admin');
  }

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

  onEdit(libro: Libro): void {
    if (!libro.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID del libro no válido'
      });
      return;
    }

    Swal.fire({
      title: 'Editar Libro',
      html: `
        <input id="swal-titulo" class="swal2-input" placeholder="Título" value="${libro.titulo}">
        <input id="swal-autor" class="swal2-input" placeholder="Autor" value="${libro.autor}">
        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción">${libro.descripcion}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const titulo = (document.getElementById('swal-titulo') as HTMLInputElement).value;
        const autor = (document.getElementById('swal-autor') as HTMLInputElement).value;
        const descripcion = (document.getElementById('swal-descripcion') as HTMLTextAreaElement).value;
        
        if (!titulo || !autor || !descripcion) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }
        
        return { titulo, autor, descripcion };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedLibro: Libro = {
          ...libro,
          titulo: result.value.titulo,
          autor: result.value.autor,
          descripcion: result.value.descripcion
        };

        this.libroService.updateLibro(libro.id!, updatedLibro).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Libro actualizado correctamente'
            });
            this.cargarLibros();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al actualizar el libro. Por favor, intente nuevamente.'
            });
            console.error('Error al actualizar:', error);
          }
        });
      }
    });
  }

  onDelete(id: number | undefined): void {
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID del libro no válido'
      });
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.libroService.deleteLibro(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El libro ha sido eliminado correctamente'
            });
            this.cargarLibros();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al eliminar el libro. Por favor, intente nuevamente.'
            });
            console.error('Error al eliminar:', error);
          }
        });
      }
    });
  }
}