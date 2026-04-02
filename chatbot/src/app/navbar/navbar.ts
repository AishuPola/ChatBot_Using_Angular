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
  public showAccessDenied: boolean = false;
  constructor(
    public router: Router,
    private local: Local,
  ) {}

  public isChatPage(): boolean {
    return this.router.url === '/chatbot';
  }

  public handleUserManagementClick(): void {
    let role: string | null = this.local.get('role');

    // in case of quotes issue
    if (typeof role === 'string') {
      role = role.replace(/"/g, '');
    }
    if (role === 'admin') {
      this.router.navigate(['/user-management']);
    } else {
      this.showAccessDenied = true;
    }
  }

  public closeAccessDenied(): void {
    this.showAccessDenied = false;
    // window.history.back();
    this.router.navigate(['/chatbot'], { replaceUrl: true });
  }
}
