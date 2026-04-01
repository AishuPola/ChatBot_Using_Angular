import { Injectable } from '@angular/core';
import { Local } from './local';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // login() {
  //   localStorage.setItem('isLoggedIn', 'true');
  // }

  private authState = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.authState.asObservable();
  constructor(private local: Local) {
    this.authState.next(!!this.local.get('access_token'));
  }

  // logout() {
  //   localStorage.removeItem('isLoggedIn');
  // }

  login(token: string) {
    this.local.set('access_token', token);
    this.authState.next(true); // triggers UI update
  }
  logout() {
    this.local.clear(); //
    // OR this.local.remove('access_token');
    this.authState.next(false);
  }

  // isAuthenticated(): boolean {
  //   return localStorage.getItem('isLoggedIn') === 'true';
  // }
  isAuthenticated(): boolean {
    return !!this.local.get('access_token');
  }
}
