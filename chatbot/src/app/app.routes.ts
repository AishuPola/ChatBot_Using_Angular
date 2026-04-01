import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { Login } from './login/login';
import { Chatbot } from './chatbot/chatbot';
import { authGuard } from './shared/guards/auth-guard';
import { UserManagement } from './user-management/user-management';
export const routes: Routes = [
  {
    path: '',
    component: Layout, //  shared wrapper
    children: [
      { path: '', component: Login }, // Page 1
      { path: 'chatbot', component: Chatbot, canActivate: [authGuard] }, // Page 2
      { path: 'user-management', component: UserManagement },
      { path: '', redirectTo: 'user-management', pathMatch: 'full' },
    ],
  },
];
