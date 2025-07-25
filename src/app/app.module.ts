import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Componentes
import { LoginComponent } from './login/login.component';

// Servicios e Interceptores
import { AuthService } from './shared/auth.service';
import { AuthInterceptor } from './shared/auth-interceptor';

// Guards
import { AuthGuard } from './shared/auth-guard';
import { AdminGuard } from './shared/admin-guard';

@NgModule({
  declarations: [
    // empty since both components are standalone
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoginComponent,
    AppComponent
  ],
  providers: [
    AuthService,
    AuthGuard,
    AdminGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule {}
