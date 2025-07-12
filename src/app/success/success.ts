import { Component } from '@angular/core';

@Component({
  selector: 'app-success',
  standalone: true,
  template: `
    <div class="success-container">
      <h1>¡Felicidades!</h1>
      <p>Has iniciado sesión correctamente</p>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    h1 { 
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.5rem;
    }
  `]
})
export class SuccessComponent {}