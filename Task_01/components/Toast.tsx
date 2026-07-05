import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface ToastProps {
  message: string | null;
  onHide: () => void;
}

export function Toast({ message, onHide }: ToastProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 2200);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: insets.top + 12,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { backgroundColor: colors.destructive, color: colors.destructiveForeground },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 100,
  },
  text: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
    textAlign: "center",
    width: "100%",
  },
});
