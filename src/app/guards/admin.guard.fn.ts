import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';

export const adminGuardFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUserRole() === 'ADMIN') {
    return true;
  }

  router.navigateByUrl('/error/404');
  return false;
};
