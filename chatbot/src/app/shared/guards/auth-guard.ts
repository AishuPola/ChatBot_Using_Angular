import { CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Local } from '../services/local';
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const local = inject(Local);

  // if (auth.isAuthenticated()) {
  //   return true;
  // } else {
  //   router.navigate(['/']);
  //   return false;
  // }
  // const token = local.get('access_token');

  // if (token) {
  //   return true; //  allow navigation
  // } else {
  //   router.navigate(['/']); //  back to login
  //   return false;
  // }

  // Use the method you already wrote in your Auth service!
  if (auth.isAuthenticated()) {
    return true; //  Token exists, let them pass
  } else {
    router.navigate(['/']); //  Redirect to login page

    return false; //  Block navigation
  }
};
