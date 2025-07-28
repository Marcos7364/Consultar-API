import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout().subscribe();
  }
}
