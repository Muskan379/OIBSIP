import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTasks } from "@/contexts/TaskContext";
import { useColors } from "@/hooks/useColors";

export default function AddTaskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTask } = useTasks();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Give your task a name.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTask(title, notes);
    router.back();
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
      ]}
      bottomOffset={40}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          New task
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="close-add-task">
          <Feather name="x" size={24} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.form}>
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Task name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                color: colors.foreground,
              },
            ]}
            placeholder="e.g. Finish project report"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              if (error) setError("");
            }}
            autoFocus
            testID="add-task-title-input"
          />
        </View>

        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                color: colors.foreground,
              },
            ]}
            placeholder="Add any details..."
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            testID="add-task-notes-input"
          />
        </View>

        {!!error && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {error}
          </Text>
        )}

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          testID="add-task-save-button"
        >
          <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>
            Add task
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  notesInput: {
    minHeight: 100,
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  saveButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
