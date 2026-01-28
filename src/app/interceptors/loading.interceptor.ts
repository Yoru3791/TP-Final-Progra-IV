import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpContextToken } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from '../services/loading-service';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private loading = inject(LoadingService);

  //Duracion en milisegundos del spiner
  private MIN_DURATION = 300;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.context.get(SKIP_LOADING)) {
      return next.handle(req);
    }

    const start = Date.now();
    this.loading.show();

    return next.handle(req).pipe(
      finalize(() => {
        const elapsed = Date.now() - start;
        const remaining = this.MIN_DURATION - elapsed;

        if (remaining > 0) {
          setTimeout(() => this.loading.hide(), remaining);
        } else {
          this.loading.hide();
        }
      })
    );
  }
}
