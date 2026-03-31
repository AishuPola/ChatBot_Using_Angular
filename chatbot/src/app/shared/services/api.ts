import { Injectable } from '@angular/core'; //allows Angular to inject this service anywhere

import { HttpClient } from '@angular/common/http'; //used to make api calls
import { environment } from '../../../environments/environment';

import { LoginRequest, LoginResponse } from '../models/login.model';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  //  Generic GET-->where <T> → generic type (response type)
  //url → endpoint (like login)
  //Returns → Observable of type T
  get<T>(url: string) {
    return this.http.get<T>(`${this.baseUrl}${url}`).pipe(
      catchError((err) => {
        console.error('GET Error:', err);
        return throwError(() => err);
      }),
    );
  }

  // Generic POST-->body -->data sent to backend
  post<T>(url: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}${url}`, body).pipe(
      catchError((err) => {
        console.error('POST Error:', err);
        return throwError(() => err);
      }),
    );
  }

  login(data: LoginRequest) {
    return this.post<LoginResponse>('login', data);
  }// after this 

  // Query API (chat)
  // query(data: { query: string }) {
  //   return this.post<any>('query', data);
  // }
}
