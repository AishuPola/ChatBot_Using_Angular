import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { LoginRequest, LoginResponse } from '../models/login.model';
@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // 🔹 Generic GET
  get<T>(url: string) {
    return this.http.get<T>(`${this.baseUrl}${url}`);
  }

  // 🔹 Generic POST
  post<T>(url: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}${url}`, body);
  }

  login(data: LoginRequest) {
    return this.post<LoginResponse>('login', data);
  }

  // Query API (chat)
  query(data: { query: string }) {
    return this.post<any>('query', data);
  }
}
