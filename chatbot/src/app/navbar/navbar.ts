import { Component } from '@angular/core';
import { Auth } from '../shared/services/auth';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Local } from '../shared/services/local';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Navbar {
  showAccessDenied = false;
  constructor(
    public router: Router,
    private local: Local,
  ) {}

  isChatPage(): boolean {
    return this.router.url === '/chatbot';
  }

  handleUserManagementClick() {
    const role = this.local.get('role');

    if (role === 'admin') {
      this.router.navigate(['/user-management']);
    } else {
      this.showAccessDenied = true;
    }
  }

  closeAccessDenied() {
    this.showAccessDenied = false;
    this.router.navigate(['/chatbot']);
  }
}
