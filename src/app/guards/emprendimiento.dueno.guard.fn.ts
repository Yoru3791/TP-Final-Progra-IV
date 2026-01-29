import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { EmprendimientoService } from '../services/emprendimiento-service';

export const emprendimientoDuenoGuardFn: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const emprendimientoService = inject(EmprendimientoService);

  const rol = auth.currentUserRole();
  const emprendimientoId = Number(route.paramMap.get('id'));

  if (rol === 'INVITADO' || rol === 'CLIENTE' || rol === 'ADMIN') {
    return true;
  }

  const usuarioId = auth.usuarioId();
  if (!usuarioId) {
    router.navigateByUrl('/login');
    return false;
  }

  const esDuenoEnMemoria = emprendimientoService.esDuenoDelEmprendimiento(
    emprendimientoId,
    usuarioId
  );
  // Si la lista está vacía, esto da false, pero no significa que sea un error todavía (caso F5)
  const listaCargada = emprendimientoService.allEmprendimientos().length > 0;

  if (listaCargada && esDuenoEnMemoria) {
    return true;
  }

  return emprendimientoService.getEmprendimientoById(emprendimientoId).pipe(
    map((emprendimiento) => {
      if (emprendimiento.dueno && emprendimiento.dueno.id === usuarioId) {
        return true;
      } else {
        router.navigateByUrl('/error/403');
        return false;
      }
    }),
    catchError(() => {
      router.navigateByUrl('/error/403'); //
      return of(false);
    })
  );
};
