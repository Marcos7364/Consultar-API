import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/auth.guard';
import { AdminGuard } from './shared/admin-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
  },
  {
    path: 'libros',
    canActivate: [AuthGuard],
    loadChildren: () => import('./libros/libros-module').then(m => m.LibrosModule),
  },
  {
    path: 'users',  // Add this new route
    canActivate: [AuthGuard],  // Protect it with AuthGuard if needed
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
  },
  { path: '', redirectTo: 'libros', pathMatch: 'full' },
  { path: '**', redirectTo: 'libros' }  // Add wildcard route for handling 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
