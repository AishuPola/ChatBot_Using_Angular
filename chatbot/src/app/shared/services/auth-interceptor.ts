import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Local } from './local';
export let authInterceptor: HttpInterceptorFn = (req, next) => {
  const local = inject(Local);

  //  Get token from localStorage
  const token = local.get('access_token');

  // skip login API because You don’t have token yet
  //No Authorization header needed
  if (req.url.includes('login')) {
    return next(req);
  }

  //  If token exists → attach it
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }
  return next(req);
};
