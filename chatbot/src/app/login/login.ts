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
import { Auth } from '../shared/services/auth';
import { Api } from '../shared/services/api';
import { Local } from '../shared/services/local';
import { LoginRequest } from '../shared/models/login.model';
import { passwordMatchValidator } from '../shared/validators/password-match.validator';
import { firstValueFrom } from 'rxjs';
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
    private api: Api,
    private local: Local,
  ) {}

  public showPassword = false;
  //public showConfirmPassword = false;
  public errorMessage: string | null = null;

  public loginForm: FormGroup = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@proclink\.com$/),
        ],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).+$/),
        ],
      }),
      // confirmPassword: new FormControl('', [Validators.required]),
    },
    // {
    //   //This is the base class for FormControl, FormGroup, and FormArray.
    //   // By typing the parameter as AbstractControl,you can access the entire group.

    //   //The Group Level: Because you need to compare two different fields, this validator is attached to the FormGroup, not the individual confirmPassword field.
    //   validators: passwordMatchValidator,
    // },
  );

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  public openLink(platform: string): void {
    const links: any = {
      facebook: 'https://www.facebook.com',
      twitter: 'https://twitter.com',
      google: 'https://accounts.google.com',
      linkedin: 'https://www.linkedin.com',
    };

    window.open(links[platform], '_blank');
  }

  //Observable → Promise
  public async onSubmit(): Promise<void> {
    this.errorMessage = '';
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue = this.loginForm.value;

    const payload: LoginRequest = {
      email: formValue.email ?? '',
      password: formValue.password ?? '',
    };

    try {
      //  Convert Observable → Promise
      const res = await firstValueFrom(this.api.login(payload));
      if (res && res.user) {
        this.local.set('role', res.user.role); // 👈 This MUST happen here
        this.local.set('userId', res.user.id);
        this.local.set('token', res.access_token);
      }
      if (!res?.access_token) {
        this.errorMessage = 'Invalid credentials';
        return;
      }
      //STORE TOKEN + UPDATE AUTH STATE
      this.auth.login(res.access_token);
      // store token
      this.local.set('access_token', res.access_token);

      //  navigate
      this.router.navigate(['/chatbot']);
    } catch (err: unknown) {
      this.errorMessage = 'Login failed, please enter correct credentials.';
    }
  }
}
