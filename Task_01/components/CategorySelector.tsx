import React from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { CATEGORIES, type CategoryId } from "@/constants/units";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CategorySelectorProps {
  value: CategoryId;
  onChange: (id: CategoryId) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondary, borderRadius: colors.radius },
      ]}
    >
      {CATEGORIES.map((category) => {
        const active = category.id === value;
        return (
          <Pressable
            key={category.id}
            testID={`category-${category.id}`}
            onPress={() => {
              if (active) return;
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              onChange(category.id);
            }}
            style={[
              styles.segment,
              {
                borderRadius: colors.radius - 4,
                backgroundColor: active ? colors.card : "transparent",
              },
              active && styles.segmentActive,
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.primary : colors.mutedForeground,
                  fontWeight: active ? "700" : "500",
                },
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 14,
  },
});
