import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { RegisterResponse } from '../interfaces/register-response';

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
  emailError: string = '';
  password: string = '';
  emailValid: boolean = false;
  showPassword: boolean = false;
  inputsDisabled: boolean = true;
  showSpinner: boolean = true;
  captchaMessage: string = '';
  loginMessage: string = '';
  showContinueButton: boolean = false;
  isRegistering: boolean = false;
  nombre: string = '';
  confirmPassword: string = '';
  showConfirmPassword: boolean = false;

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
    
    if (!this.email) {
      this.emailError = 'El correo es requerido';
    } else if (!this.emailValid) {
      this.emailError = 'Por favor ingrese un correo válido';
    } else {
      this.emailError = '';
    }
    
    this.updateContinueButton();
  }
  toggleRegister(): void {
    this.isRegistering = !this.isRegistering;
    this.resetForm();
  }

  resetForm(): void {
    this.nombre = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.emailValid = false;
    this.showContinueButton = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword && this.password.length >= 6;
  }

  onPasswordChange(): void {
    this.updateContinueButton();
  }

  validatePasswords(): boolean {
    if (!this.password || this.password.length < 6) {
      return false;
    }
    if (this.isRegistering && !this.passwordsMatch()) {
      return false;
    }
    return true;
  }

  updateContinueButton(): void {
    this.showContinueButton = this.emailValid && 
                             this.password.trim() !== '' && 
                             (!this.isRegistering || 
                              (this.nombre.trim() !== '' && 
                               this.validatePasswords()));
  }

  onSubmit(): void {
    if (!this.emailValid) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor ingrese un correo válido'
      });
      return;
    }
    this.showSpinner = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loginMessage = 'Inicio de sesión correcto';
        this.router.navigate(['/listar']);
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

onRegister(): void {
  if (!this.validatePasswords()) {
    Swal.fire({
      icon: 'error',
      title: 'Error de validación',
      text: 'Las contraseñas no coinciden o son muy cortas (mínimo 6 caracteres)'
    });
    return;
  }

  this.showSpinner = true;
  this.authService.register(this.nombre, this.email, this.password)
    .subscribe({
      next: (response: RegisterResponse) => {
        let message = '¡Registro exitoso!';
        if (response.emailSent) {
          message += '\nHemos enviado un correo de bienvenida a tu dirección de email.';
        }
        
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido/a!',
          html: `
            <p>${message}</p>
            <p class="mt-2">Por favor, revisa tu bandeja de entrada en:</p>
            <p class="font-weight-bold">${this.email}</p>
          `,
          confirmButtonText: 'Iniciar sesión'
        });
        this.isRegistering = false;
        this.resetForm();
      },
      error: (error) => {
        this.showSpinner = false;
        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: error.error.message || 'Error al registrar usuario'
        });
      },
      complete: () => {
        this.showSpinner = false;
      }
    });
 }
}
