export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at?: string;
  created_by?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  success?: boolean;
  message?: string;
}
//It ensures that every part of your app knows exactly
// what a Login request looks like (email/password)
// and what the server will send back (access_token).
