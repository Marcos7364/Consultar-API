import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRole = route.data['expectedRole']; // obtenemos rol esperado desde la ruta

    if (expectedRole && !this.authService.hasRole(expectedRole)) {
      // usuario no tiene el rol necesario
      this.router.navigate(['/libros']); // redirigir a otra página o mostrar error
      return false;
    }

    return true;
  }
}
