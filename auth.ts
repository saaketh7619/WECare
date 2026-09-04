export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: 'patient' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}
