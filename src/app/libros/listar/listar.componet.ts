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
   usuario: any = null;
   cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  terminoBusqueda: string = '';
  librosOriginales: Libro[] = []; // Añade esta línea

  libros: Libro[] = [];
  librosPaginados: Libro[] = [];
  error: string = '';
  isLoading: boolean = false;
  isAdmin: boolean = false;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalElementos: number = 0;
  totalPaginas: number = 0;
  // Add these properties
  showingFavorites: boolean = false;
  private favorites: Set<number> = new Set();
  allBooks: Libro[] = [];

  private readonly DRIVE_FOLDER_ID = '1FJRAoKK4IjSeXVkE5Hfz1QwuGLukIL3k';

  constructor(
    private libroService: LibroService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAdmin = this.authService.hasRole('admin');
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      this.favorites = new Set(JSON.parse(savedFavorites));
    }
  }

  esFavorito(id: number | undefined): boolean {
    return id ? this.favorites.has(id) : false;
  }

  toggleFavorito(libro: Libro): void {
    if (!libro.id) return;

    if (this.favorites.has(libro.id)) {
      this.favorites.delete(libro.id);
      Swal.fire({
        icon: 'success',
        title: 'Eliminado de favoritos',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000
      });
    } else {
      this.favorites.add(libro.id);
      Swal.fire({
        icon: 'success',
        title: 'Añadido a favoritos',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000
      });
    }

    localStorage.setItem('favorites', JSON.stringify(Array.from(this.favorites)));
    if (this.showingFavorites) {
      this.showFavorites(); // Refresh the list if we're in favorites view
    }
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
    this.usuario = this.authService.getUser ? this.authService.getUser() : JSON.parse(localStorage.getItem('auth_user') || '{}');
    window.addEventListener('popstate', this.handleBackNavigation);

  }
  handleBackNavigation = (event: PopStateEvent) => {
    this.cerrarSesion();
  };

  ngOnDestroy(): void {
  window.removeEventListener('popstate', this.handleBackNavigation);
  }

  eliminarCuenta(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu cuenta de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar cuenta',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteAccount().subscribe({
          next: () => {
            Swal.fire(
              '¡Cuenta eliminada!',
              'Tu cuenta ha sido eliminada correctamente.',
              'success'
            );
            this.authService.logout(); // Cierra sesión
            this.router.navigate(['/login']);
          },
          error: (error) => {
            Swal.fire(
              'Error',
              'Ocurrió un error al eliminar la cuenta. Inténtalo de nuevo.',
              'error'
            );
            console.error('Error al eliminar cuenta:', error);
          }
        });
      }
    });
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
        <input id="swal-img-url" class="swal2-input" placeholder="URL de Imagen" value="${libro.img_url || ''}">
        <input id="swal-pdf-url" class="swal2-input" placeholder="URL de PDF" value="${libro.pdf_url || ''}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const titulo = (document.getElementById('swal-titulo') as HTMLInputElement).value;
        const autor = (document.getElementById('swal-autor') as HTMLInputElement).value;
        const descripcion = (document.getElementById('swal-descripcion') as HTMLTextAreaElement).value;
        const img_url = (document.getElementById('swal-img-url') as HTMLInputElement).value.trim();
        const pdf_url = (document.getElementById('swal-pdf-url') as HTMLInputElement).value.trim();
        
        if (!titulo || !autor || !descripcion || !img_url || !pdf_url) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }

        return { titulo, autor, descripcion, img_url, pdf_url };
        
      }

      
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedLibro: Libro = {
          ...libro,
          titulo: result.value.titulo,
          autor: result.value.autor,
          descripcion: result.value.descripcion,
          img_url: result.value.img_url,
          pdf_url: result.value.pdf_url
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

 

  downloadPdf(libro: Libro): void {
    if (!libro.pdf_url) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay archivo PDF disponible para este libro'
      });
      return;
    }

    // Verificar si es una URL de Google Drive
    if (libro.pdf_url.includes('drive.google.com')) {
      // Convertir el enlace de vista a enlace de descarga
      const fileId = libro.pdf_url.match(/[-\w]{25,}/);
      if (fileId) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId[0]}`;
        window.open(downloadUrl, '_blank');
      }
    } else {
      // Si no es de Drive, abrir directamente
      window.open(libro.pdf_url, '_blank');
    }
  }


 showFavorites(): void {
  this.showingFavorites = true;
  // Filter from original list of books
  this.libros = this.librosOriginales.filter(libro => 
    libro.id && this.favorites.has(libro.id)
  );
  
  this.totalElementos = this.libros.length;
  this.paginaActual = 1; // Reset to first page
  this.calcularPaginacion();
  this.actualizarLibrosPaginados();
}

showAllBooks(): void {
  this.showingFavorites = false;
  this.libros = [...this.librosOriginales];
  this.totalElementos = this.libros.length;
  this.paginaActual = 1; // Reset to first page
  this.calcularPaginacion();
  this.actualizarLibrosPaginados();
}
     onCreateNew(): void {
    Swal.fire({
      title: 'Crear Nuevo Libro',
      html: `
        <input id="swal-titulo" class="swal2-input" placeholder="Título">
        <input id="swal-autor" class="swal2-input" placeholder="Autor">
        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>
        <input id="swal-img-url" class="swal2-input" placeholder="URL de la imagen">
        <input id="swal-pdf-url" class="swal2-input" placeholder="URL del PDF">
        <select id="swal-categoria" class="swal2-input">
          <option value="">Seleccione una categoría</option>
          <option value="1">Ficción</option>
          <option value="2">No Ficción</option>
          <option value="3">Ciencia</option>
          <!-- Add more categories as needed -->
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const titulo = (document.getElementById('swal-titulo') as HTMLInputElement).value;
        const autor = (document.getElementById('swal-autor') as HTMLInputElement).value;
        const descripcion = (document.getElementById('swal-descripcion') as HTMLTextAreaElement).value;
        const img_url = (document.getElementById('swal-img-url') as HTMLInputElement).value;
        const pdf_url = (document.getElementById('swal-pdf-url') as HTMLInputElement).value;
        const categoria_id = (document.getElementById('swal-categoria') as HTMLSelectElement).value;

        if (!titulo || !autor || !descripcion || !categoria_id) {
          Swal.showValidationMessage('Por favor complete los campos obligatorios');
          return false;
        }

        return { 
          titulo, 
          autor, 
          descripcion, 
          img_url, 
          pdf_url,
          categoria_id: parseInt(categoria_id)
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newLibro: Libro = result.value;

        this.libroService.createLibro(newLibro).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Libro creado correctamente'
            });
            this.cargarLibros(); // Reload the books list
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error.message || 'Error al crear el libro. Por favor, intente nuevamente.'
            });
            console.error('Error al crear:', error);
          }
        });
      }
    });
  }

  
}