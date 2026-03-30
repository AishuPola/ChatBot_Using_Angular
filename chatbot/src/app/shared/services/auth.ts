import { Injectable } from '@angular/core';
import { Local } from './local';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // login() {
  //   localStorage.setItem('isLoggedIn', 'true');
  // }
  constructor(private local: Local) {}
  // logout() {
  //   localStorage.removeItem('isLoggedIn');
  // }
  logout() {
    this.local.clear(); //
    // OR this.local.remove('access_token');
  }

  // isAuthenticated(): boolean {
  //   return localStorage.getItem('isLoggedIn') === 'true';
  // }
  isAuthenticated(): boolean {
    return !!this.local.get('access_token');
  }
}
