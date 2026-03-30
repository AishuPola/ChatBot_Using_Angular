import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Local {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear(); // ✅ for logout
  }
}
