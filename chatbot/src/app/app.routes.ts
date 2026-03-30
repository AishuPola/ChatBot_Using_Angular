import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './login/login';
import { Chatbot } from './chatbot/chatbot';
import { authGuard } from './shared/guards/auth-guard';
export const routes: Routes = [
  {
    path: '',
    component: Layout, // 🔥 shared wrapper
    children: [
      { path: '', component: Login }, // Page 1
      { path: 'chatbot', component: Chatbot, canActivate: [authGuard] }, // Page 2
    ],
  },
];
