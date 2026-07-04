import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { TaskRow } from "@/components/TaskRow";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { useColors } from "@/hooks/useColors";
import { Task } from "@/types";

type ListItem =
  | { type: "header"; key: string; label: string }
  | { type: "task"; key: string; task: Task };

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { tasks, toggleTask, deleteTask } = useTasks();

  const isWeb = Platform.OS === "web";

  const items = useMemo<ListItem[]>(() => {
    const active = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    const list: ListItem[] = [];
    active.forEach((t) => list.push({ type: "task", key: t.id, task: t }));
    if (completed.length > 0) {
      list.push({
        type: "header",
        key: "completed-header",
        label: `Completed (${completed.length})`,
      });
      completed.forEach((t) => list.push({ type: "task", key: t.id, task: t }));
    }
    return list;
  }, [tasks]);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete task", "This task will be permanently deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(id),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (isWeb ? 24 : 16),
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerTextGroup}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {tasks.filter((t) => !t.completed).length === 0 && tasks.length > 0
              ? "All done!"
              : "Your tasks"}
          </Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name ?? ""}
          </Text>
        </View>
        <Pressable
          onPress={handleLogout}
          hitSlop={10}
          style={[styles.logoutButton, { backgroundColor: colors.secondary }]}
          testID="logout-button"
        >
          <Feather name="log-out" size={18} color={colors.secondaryForeground} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        scrollEnabled={items.length > 0}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <Text
                style={[
                  styles.sectionHeader,
                  { color: colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            );
          }
          return (
            <TaskRow
              task={item.task}
              onToggle={toggleTask}
              onDelete={handleDelete}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/add-task");
        }}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: insets.bottom + (isWeb ? 34 : 24),
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        testID="add-task-fab"
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTextGroup: {
    gap: 2,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
