import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function EmptyState() {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconCircle, { backgroundColor: colors.secondary }]}
      >
        <Feather name="check-circle" size={30} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>
        No tasks yet
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Tap the + button to add your first task and start getting things
        done.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
    gap: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
