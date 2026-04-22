import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../../modules/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('========== AUTH GUARD ==========');
    console.log('📌 Target URL:', state.url);
    console.log('📌 Route path:', route.routeConfig?.path);
    console.log('📌 Full route config:', route.routeConfig);
    console.log('📌 Route data:', route.data);

    // Check localStorage directly
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('🔑 Token from localStorage:', token ? 'EXISTS' : 'MISSING');
    console.log('👤 User from localStorage:', userStr ? 'EXISTS' : 'MISSING');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 Parsed user:', user);
        console.log('👤 User roles:', user.roles);
      } catch (e) {
        console.log('❌ Error parsing user:', e);
      }
    }

    // Check via service
    console.log('🔑 Service says token exists:', !!this.authService.getToken());
    console.log('👤 Service says logged in:', this.authService.isLoggedIn());
    console.log('👤 Service current user:', this.authService.getCurrentUser());

    if (!this.authService.isLoggedIn()) {
      console.log('❌ NOT LOGGED IN → redirecting to signin');
      console.log('=====================================');
      this.router.navigate(['/signin']);
      return false;
    }

    const requiredRole = route.data['role'];
    const requiredRoles = route.data['roles'];
    console.log('🎯 Required role:', requiredRole);
    console.log('🎯 Required roles:', requiredRoles);

    if (requiredRole || requiredRoles) {
      const user = this.authService.getCurrentUser();
      let userRole = null;

      if (user && user.roles && user.roles.length > 0) {
        const firstRole = user.roles[0];
        console.log('🎭 First role raw:', firstRole);
        console.log('🎭 First role type:', typeof firstRole);

        if (typeof firstRole === 'string') {
          userRole = firstRole;
        } else if (firstRole && typeof firstRole === 'object') {
          // Try common property names
          const roleObj = firstRole as any;
          userRole =
            roleObj.name ||
            roleObj.role ||
            roleObj.authority ||
            JSON.stringify(roleObj);
        }
      }

      console.log('🎭 Extracted user role:', userRole);

      // Check single role
      if (requiredRole && userRole !== requiredRole) {
        console.log('❌ ROLE MISMATCH → redirecting to signin');
        console.log('=====================================');
        this.router.navigate(['/signin']);
        return false;
      }

      // Check multiple roles
      if (
        requiredRoles &&
        Array.isArray(requiredRoles) &&
        !requiredRoles.includes(userRole)
      ) {
        console.log('❌ ROLES MISMATCH → redirecting to signin');
        console.log('=====================================');
        this.router.navigate(['/signin']);
        return false;
      }
    }

    console.log('✅ ACCESS GRANTED');
    console.log('=====================================');
    return true;
  }
}
