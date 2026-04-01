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
  showDeleteConfirm: boolean = false;
  userIdToDelete: string | null = null;

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
    this.cdr.detectChanges();
  }

  async loadUsers() {
    try {
      const res: ListUsersResponse = await firstValueFrom(this.api.listUsers());

      console.log('Users API:', res);

      this.users = res.users;
    } catch (error) {
      console.error('Failed to load users:', error);
      // alert('Failed to load users');
    }
  }

  // async loadUsers() {
  //   try {
  //     const res: ListUsersResponse = await firstValueFrom(this.api.listUsers());
  //     console.log('Users API Response:', res);

  //     // Update the array
  //     this.users = [...res.users]; // Use spread operator to ensure a new reference

  //     // FORCE UI Update
  //     this.cdr.detectChanges();
  //   } catch (error) {
  //     console.error('Failed to load users:', error);
  //     alert('Failed to load users');
  //   }
  // }
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // async createUser() {
  //   try {
  //     const payload: CreateUserRequest = {
  //       username: this.newUser.username,
  //       email: this.newUser.email,
  //       password: this.newUser.password,
  //       role: this.newUser.role,
  //     };

  //     // 🔥 API CALL FIRST
  //     const res: CreateUserResponse = await firstValueFrom(this.api.createUser(payload));

  //     console.log('Create response:', res);

  //     // ✅ Store role
  //     this.local.set('role', res.user.role);

  //     // ✅ Close modal
  //     //this.closeModal();

  //     // ✅ Reset form
  //     this.newUser = {
  //       username: '',
  //       email: '',
  //       password: '',
  //       role: 'user',
  //     };

  //     // 🔥 RELOAD USERS (IMPORTANT)
  //     await this.loadUsers();
  //     this.closeModal();
  //   } catch (error: any) {
  //     console.error('Create user failed:', error);

  //     // show backend error if exists
  //     alert(error?.error?.message || 'Failed to create user');
  //   }
  // }

  // async createUser() {
  //   try {
  //     const payload: CreateUserRequest = {
  //       username: this.newUser.username,
  //       email: this.newUser.email,
  //       password: this.newUser.password,
  //       role: this.newUser.role,
  //     };

  //     // ✅ CREATE API
  //     const res: CreateUserResponse = await firstValueFrom(this.api.createUser(payload));

  //     console.log('Create response:', res);

  //     // ✅ Store role
  //     this.local.set('role', res.user.role);

  //     // ✅ Reset form
  //     this.newUser = {
  //       username: '',
  //       email: '',
  //       password: '',
  //       role: 'user',
  //     };

  //     // ✅ Close modal
  //     this.closeModal();

  //     // 🔥 SEPARATE TRY for loadUsers
  //     try {
  //       await this.loadUsers();
  //     } catch (loadError) {
  //       console.error('Load users failed:', loadError);
  //     }
  //   } catch (error: any) {
  //     console.error('Create user failed:', error);
  //     alert(error?.error?.message || 'Failed to create user');
  //   }
  // }

  async createUser() {
    try {
      const payload: CreateUserRequest = {
        username: this.newUser.username,
        email: this.newUser.email,
        password: this.newUser.password,
        role: this.newUser.role,
      };

      // 1. Call API
      const res: CreateUserResponse = await firstValueFrom(this.api.createUser(payload));
      console.log('Create response:', res);

      // 2. Safety Check: Only store role if res.user exists
      if (res?.user) {
        this.local.set('role', res.user.role);
        this.local.set('userId', res.user.id);
      }

      // 3. Reset form
      this.newUser = {
        username: '',
        email: '',
        password: '',
        role: 'user',
      };

      // 4. Close modal and Refresh table
      this.closeModal();

      try {
        await this.loadUsers();
        this.cdr.detectChanges();
      } catch (loadErr) {
        console.error('Load users failed:', loadErr);
      }
      //await this.loadUsers(); // Refresh the list

      // Optional: Show success message instead of nothing
      console.log('User created and list refreshed');
    } catch (error: any) {
      console.error('Create user failed:', error);
      // This alert triggers if the API fails OR if your code above crashes
      alert(error?.error?.message || 'Failed to create user');
    }
  }
  deleteUser(id: string) {
    this.userIdToDelete = id;
    this.showDeleteConfirm = true;
  }
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.userIdToDelete = null;
  }

  async confirmDelete() {
    if (!this.userIdToDelete) return;

    const id = this.userIdToDelete;
    console.log('Deleting user with ID:', id);
    // const url = `/api/user-management/user/id/${id}`;

    try {
      this.showDeleteConfirm = false; // Hide modal during API call
      const res = await firstValueFrom(this.api.deleteUser(id));
      console.log('User deleted successfully:', res);

      await this.loadUsers();
      this.cdr.detectChanges();
      //  refresh UI

      // await this.loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err?.error?.message || 'Failed to delete user');
    } finally {
      this.userIdToDelete = null;
    }
  }
}
