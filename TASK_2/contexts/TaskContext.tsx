import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { Task } from "@/types";

interface TaskContextValue {
  tasks: Task[];
  isLoading: boolean;
  addTask: (title: string, notes: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

function tasksKey(userId: string): string {
  return `todo_app_tasks_${userId}`;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    (async () => {
      const raw = await AsyncStorage.getItem(tasksKey(user.id));
      if (cancelled) return;
      if (raw) {
        try {
          setTasks(JSON.parse(raw) as Task[]);
        } catch {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const persist = useCallback(
    async (next: Task[]) => {
      if (!user) return;
      setTasks(next);
      await AsyncStorage.setItem(tasksKey(user.id), JSON.stringify(next));
    },
    [user],
  );

  const addTask = useCallback(
    async (title: string, notes: string) => {
      if (!user) return;
      const newTask: Task = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
        userId: user.id,
        title: title.trim(),
        notes: notes.trim(),
        completed: false,
        createdAt: Date.now(),
        completedAt: null,
      };
      await persist([newTask, ...tasks]);
    },
    [tasks, user, persist],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const next = tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : null,
            }
          : t,
      );
      await persist(next);
    },
    [tasks, persist],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const next = tasks.filter((t) => t.id !== id);
      await persist(next);
    },
    [tasks, persist],
  );

  const value = useMemo(
    () => ({ tasks, isLoading, addTask, toggleTask, deleteTask }),
    [tasks, isLoading, addTask, toggleTask, deleteTask],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within a TaskProvider");
  return ctx;
}
