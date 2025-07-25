import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../servicios/libro.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  standalone: true,
  imports: [CommonModule] 
})
export class ListarComponent implements OnInit {
  libros: any[] = [];
  error: string = '';

  constructor(private libroService: LibroService) {}

  ngOnInit(): void {
    this.libroService.getLibros()
      .pipe(
        catchError(error => {
          this.error = 'Error al cargar los libros';
          return of([]);
        })
      )
      .subscribe(data => {
        this.libros = data;
      });
  }
}
