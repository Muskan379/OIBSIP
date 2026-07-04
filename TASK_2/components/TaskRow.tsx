import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(task.id);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(task.id);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={handleToggle}
        hitSlop={8}
        style={[
          styles.checkbox,
          {
            borderColor: task.completed ? colors.success : colors.border,
            backgroundColor: task.completed ? colors.success : "transparent",
          },
        ]}
        testID={`task-checkbox-${task.id}`}
      >
        {task.completed && <Feather name="check" size={14} color="#ffffff" />}
      </Pressable>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: task.completed ? colors.mutedForeground : colors.foreground,
              textDecorationLine: task.completed ? "line-through" : "none",
            },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {!!task.notes && (
          <Text
            style={[
              styles.notes,
              {
                color: colors.mutedForeground,
                textDecorationLine: task.completed ? "line-through" : "none",
              },
            ]}
            numberOfLines={2}
          >
            {task.notes}
          </Text>
        )}
      </View>

      <Pressable
        onPress={handleDelete}
        hitSlop={8}
        style={styles.deleteButton}
        testID={`task-delete-${task.id}`}
      >
        <Feather name="trash-2" size={18} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  notes: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  deleteButton: {
    padding: 4,
    marginTop: 2,
  },
});
