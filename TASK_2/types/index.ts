export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  notes: string;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
}
