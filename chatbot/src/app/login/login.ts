import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth';
@Component({
  selector: 'app-login',

  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Login {
  constructor(
    private router: Router,
    private auth: Auth,
  ) {}
  showPassword = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/),
    ]),
  });

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  openLink(platform: string) {
    const links: any = {
      facebook: 'https://www.facebook.com',
      twitter: 'https://twitter.com',
      google: 'https://accounts.google.com',
      linkedin: 'https://www.linkedin.com',
    };

    window.open(links[platform], '_blank');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.auth.login();
      this.router.navigate(['/chatbot']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
