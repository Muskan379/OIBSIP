import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    router.replace("/tasks");
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 },
      ]}
      bottomOffset={40}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
        <Feather name="user-plus" size={28} color={colors.primaryForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>
        Create your account
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Start organizing your tasks in seconds
      </Text>

      <View style={styles.form}>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Feather name="user" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Full name"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            testID="register-name-input"
          />
        </View>

        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Feather name="mail" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Email"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            testID="register-email-input"
          />
        </View>

        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Feather name="lock" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            testID="register-password-input"
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        {!!error && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {error}
          </Text>
        )}

        <Pressable
          onPress={handleRegister}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed || isSubmitting ? 0.85 : 1,
            },
          ]}
          testID="register-submit-button"
        >
          <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
            {isSubmitting ? "Creating account..." : "Register"}
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?
          </Text>
          <Link href="/login" replace asChild>
            <Pressable hitSlop={8}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Log in
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
    gap: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  primaryButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
