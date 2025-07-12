import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  emailValid: boolean = false;
  showPassword: boolean = false;
  inputsDisabled: boolean = true;
  showSpinner: boolean = true;
  captchaMessage: string = '';
  loginMessage: string = '';
  showContinueButton: boolean = false;
  

  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Reduce timeout to 1 second
    setTimeout(() => {
      this.showSpinner = false;
      this.inputsDisabled = false;
      this.captchaMessage = '¡Felicidades, eres humano!';
    }, 1000);
  }

  validateEmail(): void {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValid = pattern.test(this.email);
    this.updateContinueButton();
  }

  updateContinueButton(): void {
    this.showContinueButton = this.emailValid && this.password.trim() !== '';
  }

  onPasswordChange(): void {
    this.updateContinueButton();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.showSpinner = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loginMessage = 'Inicio de sesión correcto';
        this.router.navigate(['/users']);
      },
      error: () => {
        this.showSpinner = false;
        Swal.fire({
          title: 'Error',
          text: 'Credenciales inválidas',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        this.loginMessage = 'Credenciales incorrectas';
      }
    });
  }
}
