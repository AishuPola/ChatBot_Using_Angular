import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../../footer/footer';
import { Header } from '../../../header/header';
import { Navbar } from '../../../navbar/navbar';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Header, Footer, Navbar],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
