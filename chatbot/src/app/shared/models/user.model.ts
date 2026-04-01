// 🔹 Request
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

// 🔹 Inner User object
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  created_by: string;
}

// 🔹 Full API Response
export interface CreateUserResponse {
  message: string;
  user: User;
  note: string;
}

export interface ListUsersResponse {
  users: User[];
}
export interface DeleteUserResponse {
  message: string;
  deleted_user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  deleted_by: string;
  success: boolean;
}
