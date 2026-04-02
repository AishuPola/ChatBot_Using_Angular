import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Footer } from '../../../footer/footer';
import { Header } from '../../../header/header';
import { Navbar } from '../../../navbar/navbar';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Header, Footer, Navbar, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  constructor(
    public auth: Auth,
    public router: Router,
  ) {}
}
