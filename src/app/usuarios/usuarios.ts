import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';  // <-- Importa CommonModule

import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.authService.getAllUsers().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  eliminarUsuario(id: number): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.authService.deleteUser(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El usuario fue eliminado.', 'success');
            this.cargarUsuarios();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error')
        });
      }
    });
  }

onCreateUser(): void {
  Swal.fire({
    title: 'Crear Nuevo Usuario',
    html: `
      <input id="swal-nombre" class="swal2-input" placeholder="Nombre">
      <input id="swal-email" class="swal2-input" placeholder="Email" type="email">
      <input id="swal-password" class="swal2-input" placeholder="Contraseña" type="password">
      <select id="swal-rol" class="swal2-select">
        <option value="">Seleccione rol</option>
        <option value="usuario">Usuario</option>
        <option value="admin">Administrador</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value.trim();
      const email = (document.getElementById('swal-email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('swal-password') as HTMLInputElement).value;
      const rol = (document.getElementById('swal-rol') as HTMLSelectElement).value;

      if (!nombre || !email || !password || !rol) {
        Swal.showValidationMessage('Por favor completa todos los campos');
        return false;
      }

      return { nombre, email, password, rol };
    }
  }).then(result => {
    if (result.isConfirmed) {
      this.authService.createUser(result.value).subscribe({
        next: () => {
          Swal.fire('Creado', 'El usuario fue creado correctamente.', 'success');
          this.cargarUsuarios();  // refrescar lista
        },
        error: (error) => {
          Swal.fire('Error', 'No se pudo crear el usuario.', 'error');
          console.error(error);
        }
      });
    }
  });
}

onEditUser(user: any): void {
  Swal.fire({
    title: 'Actualizar Usuario',
    html: `
      <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${user.nombre}">
      <input id="swal-email" class="swal2-input" placeholder="Email" type="email" value="${user.email}">
      <select id="swal-rol" class="swal2-select">
        <option value="">Seleccione rol</option>
        <option value="usuario" ${user.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
        <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value.trim();
      const email = (document.getElementById('swal-email') as HTMLInputElement).value.trim();
      const rol = (document.getElementById('swal-rol') as HTMLSelectElement).value;

      if (!nombre || !email || !rol) {
        Swal.showValidationMessage('Por favor completa todos los campos');
        return false;
      }

      return { nombre, email, rol };
    }
  }).then(result => {
    if (result.isConfirmed) {
      this.authService.updateUser(user.id, result.value).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El usuario fue actualizado correctamente.', 'success');
          this.cargarUsuarios();  // refrescar lista
        },
        error: (error) => {
          Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
          console.error(error);
        }
      });
    }
  });
}

}
