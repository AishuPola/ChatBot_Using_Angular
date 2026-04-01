import { Component } from '@angular/core';
import { Auth } from '../shared/services/auth';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Navbar {
  constructor(public router: Router) {}
  isChatPage(): boolean {
    return this.router.url === '/chatbot';
  }
}
