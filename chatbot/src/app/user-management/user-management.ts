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
  public showModal = false;

  public users: User[] = [];
  public showPassword = false;
  public showDeleteConfirm: boolean = false;
  public userIdToDelete: string | null = null;
  public deleteErrorMessage: string = '';
  public isDeleting: boolean = false;
  public createErrorMessage: string = '';
  public isCreating: boolean = false;
  public showAccessDenied: boolean = false;

  public newUser: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    role: 'user',
  };
  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  public async ngOnInit(): Promise<void> {
    const role = this.local.get('role');
    //  If not admin → block access
    if (role !== 'admin') {
      this.showAccessDenied = true;
      this.cdr.detectChanges();
      return;
    }

    await this.loadUsers();
    this.cdr.detectChanges();
  }
  // public async ionViewWillEnter(): Promise<void> {
  //   let role: string | null = this.local.get('role');

  //   //  safety fix (handle quotes issue)
  //   if (typeof role === 'string') {
  //     role = role.replace(/"/g, '');
  //   }

  //   if (role !== 'admin') {
  //     this.showAccessDenied = true;
  //     return;
  //   }

  //   this.showAccessDenied = false;

  //   await this.loadUsers();
  //   this.cdr.detectChanges();
  // }

  public async loadUsers(): Promise<void> {
    try {
      const res: ListUsersResponse = await firstValueFrom(this.api.listUsers());

      this.users = res.users;
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  public openModal(): void {
    this.showModal = true;
    this.createErrorMessage = '';
    this.showPassword = false; // Reset to hidden when modal opens
  }

  public closeModal(): void {
    this.showModal = false;
    //resets the form
    this.newUser = {
      username: '',
      email: '',
      password: '',
      role: 'user',
    };
    //clear the errors
    this.createErrorMessage = '';
  }

  public async createUser(): Promise<void> {
    try {
      this.createErrorMessage = ''; // reset
      this.isCreating = true;
      const userExists = this.users.some(
        (user) => user.username === this.newUser.username || user.email === this.newUser.email,
      );
      if (userExists) {
        this.createErrorMessage = 'User already exists with same username or email';
        this.isCreating = false;
        return;
      }
      const payload: CreateUserRequest = {
        username: this.newUser.username,
        email: this.newUser.email,
        password: this.newUser.password,
        role: this.newUser.role,
      };

      //  Call API
      const res: CreateUserResponse = await firstValueFrom(this.api.createUser(payload));

      // Safety Check: Only store role if res.user exists
      if (res?.user) {
        this.local.set('role', res.user.role);
        this.local.set('userId', res.user.id);
      }

      //  Reset form
      this.newUser = {
        username: '',
        email: '',
        password: '',
        role: 'user',
      };

      // 4. Close modal and Refresh table
      this.closeModal();

      await this.loadUsers();
      this.cdr.detectChanges();
    } catch (error: any) {
      // This alert triggers if the API fails OR if your code above crashes
      this.createErrorMessage = error?.error?.message || 'Failed to create user';
    } finally {
      this.isCreating = false;
    }
  }
  public deleteUser(id: string): void {
    this.userIdToDelete = id;
    this.showDeleteConfirm = true;
    this.deleteErrorMessage = '';
  }
  public cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.userIdToDelete = null;
  }

  public async confirmDelete(): Promise<void> {
    if (!this.userIdToDelete) return;

    const id = this.userIdToDelete;
    this.deleteErrorMessage = ''; //  clear old error
    this.isDeleting = true;

    try {
      this.showDeleteConfirm = false; // Hide modal during API call
      const res = await firstValueFrom(this.api.deleteUser(id));

      await this.loadUsers();
      this.cdr.detectChanges();
    } catch (err: any) {
      //  showing error message
      this.deleteErrorMessage = err?.error?.message || 'Failed to delete user';
    } finally {
      this.isDeleting = false;
      this.userIdToDelete = null;
    }
  }

  public goToChatbot(): void {
    this.showAccessDenied = false;
    this.router.navigate(['/chatbot']);
  }
}
