import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(
    public auth: Auth,
    private router: Router,
  ) {}
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}

