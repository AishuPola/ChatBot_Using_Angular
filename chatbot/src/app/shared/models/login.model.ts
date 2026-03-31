export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}
//It ensures that every part of your app knows exactly
// what a Login request looks like (email/password)
// and what the server will send back (access_token).
