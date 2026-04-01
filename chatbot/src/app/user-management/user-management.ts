import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CreateUserRequest, CreateUserResponse, User } from '../shared/models/user.model';
import { firstValueFrom } from 'rxjs';
import { Api } from '../shared/services/api';
import { Local } from '../shared/services/local';
import { OnInit, ChangeDetectorRef } from '@angular/core';
import { ListUsersResponse, DeleteUserResponse } from '../shared/models/user.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
  standalone: true,
})
export class UserManagement implements OnInit {
  constructor(
    private api: Api,
    private local: Local,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    // Listen to route changes
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.router.url.includes('user-management')) {
        this.loadUsers();
      }
    });
  }
  showModal = false;

  users: User[] = [];

  newUser: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    role: 'user',
  };
  // async ngAfterViewInit() {
  //   console.log('AfterViewInit');
  //   await this.loadUsers();
  // }
  async ngOnInit() {
    console.log('UserManagement Loaded');
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      const res: ListUsersResponse = await firstValueFrom(this.api.listUsers());

      console.log('Users API:', res);

      this.users = res.users;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users');
    }
  }
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async createUser() {
    try {
      await this.loadUsers();
      const payload: CreateUserRequest = {
        username: this.newUser.username,
        email: this.newUser.email,
        password: this.newUser.password,
        role: this.newUser.role,
      };
      //  Reload users from backend

      //  API CALL
      const res: CreateUserResponse = await firstValueFrom(this.api.createUser(payload));
      // ✅ Store role in localStorage
      this.local.set('role', res.user.role);

      // ✅ Add user to table (from response)
      this.users.push(res.user);

      // ✅ Reset form
      this.newUser = {
        username: '',
        email: '',
        password: '',
        role: 'user',
      };

      this.closeModal();
    } catch (error) {
      console.error('Create user failed:', error);
      alert('Failed to create user');
    }
  }
}
