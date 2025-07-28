import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../servicios/libro.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Libro } from '../../interfaces/libro.interface';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms'; // Añade esta importación


@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styleUrls: ['./listar.css']
})
export class ListarComponent implements OnInit {
  terminoBusqueda: string = '';
  librosOriginales: Libro[] = []; // Añade esta línea

  libros: Libro[] = [];
  librosPaginados: Libro[] = [];
  error: string = '';
  isLoading: boolean = false;
  isAdmin: boolean = false;

  // Variables para paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  constructor(
    private libroService: LibroService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAdmin = this.authService.hasRole('admin');
  }

  buscarLibros(event?: Event): void {
  if (event) {
    event.preventDefault(); // Prevenir recarga de página en el formulario
  }

  if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
    // Si no hay término, mostrar todos los libros
    this.libros = [...this.librosOriginales || this.libros];
  } else {
    // Filtrar libros localmente
    const termino = this.terminoBusqueda.toLowerCase().trim();
    this.libros = (this.librosOriginales || this.libros).filter(libro => 
      libro.titulo.toLowerCase().includes(termino) || 
      (libro.autor && libro.autor.toLowerCase().includes(termino))
    );
  }

  // Actualizar paginación
  this.totalElementos = this.libros.length;
  this.paginaActual = 1;
  this.calcularPaginacion();
  this.actualizarLibrosPaginados();
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
        this.librosOriginales = [...data]; // Guarda copia de los originales

        this.totalElementos = data.length;
        this.calcularPaginacion();
        this.actualizarLibrosPaginados();
      });
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.totalElementos / this.elementosPorPagina);
    
    // Asegurar que la página actual esté dentro del rango válido
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }
    if (this.paginaActual < 1) {
      this.paginaActual = 1;
    }
  }

  actualizarLibrosPaginados(): void {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.librosPaginados = this.libros.slice(inicio, fin);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarLibrosPaginados();
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarLibrosPaginados();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarLibrosPaginados();
    }
  }

  // Métodos auxiliares para la paginación
  get puedeIrAnterior(): boolean {
    return this.paginaActual > 1;
  }

  get puedeIrSiguiente(): boolean {
    return this.paginaActual < this.totalPaginas;
  }

  get rangoElementos(): string {
    if (this.totalElementos === 0) {
      return 'No hay elementos';
    }
    
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.elementosPorPagina, this.totalElementos);
    
    return `${inicio} - ${fin} de ${this.totalElementos}`;
  }

  // Generar array de números de página para mostrar en la paginación
  get numerosPagina(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
    
    // Ajustar el inicio si estamos cerca del final
    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
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