import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
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
    private fb: FormBuilder,
  ) {}
  showPassword = false;
  showConfirmPassword = false;

  loginForm = new FormGroup(
    {
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@proclink\.com$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required, //  added
      ]),
    },
    {
      validators: (group: AbstractControl) => {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { passwordMismatch: true };
      },
    },
  );

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
      //  shows all errors
      this.router.navigate(['/chatbot']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
