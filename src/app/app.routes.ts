import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SuccessComponent } from './success/success';
import { AuthGuard } from './auth/auth.guard';
import { UsersComponent } from './users/users.component';
import { inject } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'success', component: SuccessComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'users', component: UsersComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: '**', redirectTo: 'login' }
];