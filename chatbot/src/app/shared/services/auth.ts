import { Injectable } from '@angular/core';
import { Local } from './local';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private authState = new BehaviorSubject<boolean>(false);

  public isAuthenticated$: Observable<boolean> = this.authState.asObservable();
  constructor(private local: Local) {
    this.authState.next(!!this.local.get('access_token'));
  }

  public login(token: string): void {
    this.local.set('access_token', token);
    this.authState.next(true); // triggers UI update
  }
  public logout(): void {
    this.local.clear(); //
    // OR this.local.remove('access_token');
    this.authState.next(false);
  }

  // isAuthenticated(): boolean {
  //   return localStorage.getItem('isLoggedIn') === 'true';
  // }
  public isAuthenticated(): boolean {
    return !!this.local.get('access_token');
  }
}
