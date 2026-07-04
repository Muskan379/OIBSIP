import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { hashPassword, verifyPassword } from "@/lib/hash";
import { User } from "@/types";

const USERS_KEY = "todo_app_users";
const SESSION_KEY = "todo_app_session_user_id";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

async function saveUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sessionUserId = await AsyncStorage.getItem(SESSION_KEY);
        if (sessionUserId) {
          const users = await loadUsers();
          const found = users.find((u) => u.id === sessionUserId) ?? null;
          setUser(found);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const trimmedName = name.trim();
      const normalizedEmail = normalizeEmail(email);

      if (!trimmedName || !normalizedEmail || !password) {
        return { success: false, error: "Please fill in all fields." };
      }
      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };
      }

      const users = await loadUsers();
      const exists = users.some(
        (u) => normalizeEmail(u.email) === normalizedEmail,
      );
      if (exists) {
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }

      const passwordHash = await hashPassword(password);
      const newUser: User = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        createdAt: Date.now(),
      };

      const updatedUsers = [...users, newUser];
      await saveUsers(updatedUsers);
      await AsyncStorage.setItem(SESSION_KEY, newUser.id);
      setUser(newUser);
      return { success: true };
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return { success: false, error: "Please enter your email and password." };
    }

    const users = await loadUsers();
    const found = users.find(
      (u) => normalizeEmail(u.email) === normalizedEmail,
    );
    if (!found) {
      return { success: false, error: "Invalid email or password." };
    }

    const valid = await verifyPassword(password, found.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password." };
    }

    await AsyncStorage.setItem(SESSION_KEY, found.id);
    setUser(found);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
