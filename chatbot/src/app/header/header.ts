import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth';
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {}
  logout() {
    this.auth.logout(); // 🔥 clear login
    this.router.navigate(['/']); // 🔥 go back to login
  }
}
