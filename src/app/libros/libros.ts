import { Component, OnInit } from '@angular/core';
import { LibroService } from '../servicios/libro.service';
import { Libro } from '../interfaces/libro.interface';

@Component({
  selector: 'app-libros',
  standalone: false,
  templateUrl: './libros.html',
  styleUrl: './libros.css'
})
export class Libros implements OnInit {
  libros: Libro[] = [];
  error: string = '';

  constructor(private libroService: LibroService) {}

  ngOnInit(): void {
    this.libroService.getLibros().subscribe({
      next: (data) => this.libros = data,
      error: () => this.error = 'Error al cargar los libros'
    });
  }
}