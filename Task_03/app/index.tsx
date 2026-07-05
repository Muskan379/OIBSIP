import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Operator = "+" | "-" | "×" | "÷";

const MAX_DISPLAY_LENGTH = 12;

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "Error";

  if (Number.isInteger(value)) {
    const str = value.toString();
    if (str.length <= MAX_DISPLAY_LENGTH) return str;
    return value.toExponential(6);
  }

  let str = value.toString();
  if (str.length > MAX_DISPLAY_LENGTH) {
    const decimals = Math.max(0, MAX_DISPLAY_LENGTH - str.split(".")[0]!.length - 1);
    str = value.toFixed(decimals);
    str = str.replace(/0+$/, "").replace(/\.$/, "");
  }
  return str;
}

function applyOperator(a: number, op: Operator, b: number): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0) return NaN;
      return a / b;
  }
}

interface CalcState {
  display: string;
  storedValue: number | null;
  pendingOperator: Operator | null;
  isError: boolean;
  awaitingNewValue: boolean;
  justEvaluated: boolean;
}

const initialState: CalcState = {
  display: "0",
  storedValue: null,
  pendingOperator: null,
  isError: false,
  awaitingNewValue: false,
  justEvaluated: false,
};

export default function CalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<CalcState>(initialState);

  const hapticTap = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  const handleClear = useCallback(() => {
    hapticTap();
    setState(initialState);
  }, [hapticTap]);

  const handleBackspace = useCallback(() => {
    hapticTap();
    setState((prev) => {
      if (prev.isError) return initialState;
      if (prev.awaitingNewValue || prev.justEvaluated) return prev;

      const nextDisplay =
        prev.display.length > 1 ? prev.display.slice(0, -1) : "0";
      return {
        ...prev,
        display: nextDisplay === "-" ? "0" : nextDisplay,
      };
    });
  }, [hapticTap]);

  const handleDigit = useCallback(
    (digit: string) => {
      hapticTap();
      setState((prev) => {
        if (prev.isError) {
          return {
            ...initialState,
            display: digit,
          };
        }

        if (prev.awaitingNewValue || prev.justEvaluated) {
          return {
            ...prev,
            display: digit,
            awaitingNewValue: false,
            justEvaluated: false,
          };
        }

        if (prev.display === "0") {
          return { ...prev, display: digit };
        }

        if (prev.display.replace("-", "").replace(".", "").length >= MAX_DISPLAY_LENGTH) {
          return prev;
        }

        return { ...prev, display: prev.display + digit };
      });
    },
    [hapticTap],
  );

  const handleDecimal = useCallback(() => {
    hapticTap();
    setState((prev) => {
      if (prev.isError) {
        return { ...initialState, display: "0." };
      }

      if (prev.awaitingNewValue || prev.justEvaluated) {
        return {
          ...prev,
          display: "0.",
          awaitingNewValue: false,
          justEvaluated: false,
        };
      }

      if (prev.display.includes(".")) return prev;

      return { ...prev, display: prev.display + "." };
    });
  }, [hapticTap]);

  const handleToggleSign = useCallback(() => {
    hapticTap();
    setState((prev) => {
      if (prev.isError) return prev;
      if (prev.display === "0") return prev;

      const nextDisplay = prev.display.startsWith("-")
        ? prev.display.slice(1)
        : "-" + prev.display;
      return { ...prev, display: nextDisplay, justEvaluated: false };
    });
  }, [hapticTap]);

  const handleOperator = useCallback(
    (op: Operator) => {
      hapticTap();
      setState((prev) => {
        if (prev.isError) return prev;

        const currentValue = parseFloat(prev.display);

        if (prev.pendingOperator && !prev.awaitingNewValue) {
          const result = applyOperator(
            prev.storedValue ?? 0,
            prev.pendingOperator,
            currentValue,
          );
          if (!Number.isFinite(result)) {
            return { ...initialState, display: "Error", isError: true };
          }
          return {
            display: formatNumber(result),
            storedValue: result,
            pendingOperator: op,
            isError: false,
            awaitingNewValue: true,
            justEvaluated: false,
          };
        }

        return {
          ...prev,
          storedValue: currentValue,
          pendingOperator: op,
          awaitingNewValue: true,
          justEvaluated: false,
        };
      });
    },
    [hapticTap],
  );

  const handleEquals = useCallback(() => {
    hapticTap();
    setState((prev) => {
      if (prev.isError) return prev;
      if (prev.pendingOperator === null) return prev;

      const currentValue = parseFloat(prev.display);
      const result = applyOperator(
        prev.storedValue ?? 0,
        prev.pendingOperator,
        currentValue,
      );

      if (!Number.isFinite(result)) {
        return { ...initialState, display: "Error", isError: true };
      }

      return {
        display: formatNumber(result),
        storedValue: null,
        pendingOperator: null,
        isError: false,
        awaitingNewValue: false,
        justEvaluated: true,
      };
    });
  }, [hapticTap]);

  const expressionText =
    state.storedValue !== null && state.pendingOperator
      ? `${formatNumber(state.storedValue)} ${state.pendingOperator}`
      : "";

  const displayFontSize = state.display.length > 8 ? 48 : state.display.length > 6 ? 56 : 64;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
        },
      ]}
    >
      <View style={styles.displaySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.expressionScroll}
        >
          <Text
            style={[styles.expressionText, { color: colors.mutedForeground }]}
            testID="expression-display"
          >
            {expressionText || " "}
          </Text>
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.resultScroll}
          contentContainerStyle={styles.resultScrollContent}
        >
          <Text
            testID="result-display"
            style={[
              styles.resultText,
              {
                color: state.isError ? colors.destructive : colors.foreground,
                fontSize: displayFontSize,
              },
            ]}
            numberOfLines={1}
          >
            {state.display}
          </Text>
        </ScrollView>
      </View>

      <View style={styles.keypad}>
        <KeypadRow>
          <CalcButton
            label="C"
            onPress={handleClear}
            variant="function"
            testID="btn-clear"
          />
          <CalcButton
            label="+/-"
            onPress={handleToggleSign}
            variant="function"
            testID="btn-sign"
          />
          <CalcButton
            label="⌫"
            onPress={handleBackspace}
            variant="function"
            testID="btn-backspace"
          />
          <CalcButton
            label="÷"
            onPress={() => handleOperator("÷")}
            variant="operator"
            active={state.pendingOperator === "÷" && state.awaitingNewValue}
            testID="btn-divide"
          />
        </KeypadRow>

        <KeypadRow>
          <CalcButton label="7" onPress={() => handleDigit("7")} testID="btn-7" />
          <CalcButton label="8" onPress={() => handleDigit("8")} testID="btn-8" />
          <CalcButton label="9" onPress={() => handleDigit("9")} testID="btn-9" />
          <CalcButton
            label="×"
            onPress={() => handleOperator("×")}
            variant="operator"
            active={state.pendingOperator === "×" && state.awaitingNewValue}
            testID="btn-multiply"
          />
        </KeypadRow>

        <KeypadRow>
          <CalcButton label="4" onPress={() => handleDigit("4")} testID="btn-4" />
          <CalcButton label="5" onPress={() => handleDigit("5")} testID="btn-5" />
          <CalcButton label="6" onPress={() => handleDigit("6")} testID="btn-6" />
          <CalcButton
            label="−"
            onPress={() => handleOperator("-")}
            variant="operator"
            active={state.pendingOperator === "-" && state.awaitingNewValue}
            testID="btn-subtract"
          />
        </KeypadRow>

        <KeypadRow>
          <CalcButton label="1" onPress={() => handleDigit("1")} testID="btn-1" />
          <CalcButton label="2" onPress={() => handleDigit("2")} testID="btn-2" />
          <CalcButton label="3" onPress={() => handleDigit("3")} testID="btn-3" />
          <CalcButton
            label="+"
            onPress={() => handleOperator("+")}
            variant="operator"
            active={state.pendingOperator === "+" && state.awaitingNewValue}
            testID="btn-add"
          />
        </KeypadRow>

        <KeypadRow>
          <CalcButton
            label="0"
            onPress={() => handleDigit("0")}
            wide
            testID="btn-0"
          />
          <CalcButton label="." onPress={handleDecimal} testID="btn-decimal" />
          <CalcButton
            label="="
            onPress={handleEquals}
            variant="equals"
            testID="btn-equals"
          />
        </KeypadRow>
      </View>
    </View>
  );
}

function KeypadRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

interface CalcButtonProps {
  label: string;
  onPress: () => void;
  variant?: "digit" | "operator" | "function" | "equals";
  active?: boolean;
  wide?: boolean;
  testID?: string;
}

function CalcButton({
  label,
  onPress,
  variant = "digit",
  active = false,
  wide = false,
  testID,
}: CalcButtonProps) {
  const colors = useColors();

  const backgroundColor = active
    ? colors.background
    : variant === "operator"
      ? colors.primary
      : variant === "equals"
        ? colors.primary
        : variant === "function"
          ? colors.secondary
          : colors.card;

  const textColor =
    active
      ? colors.primary
      : variant === "operator" || variant === "equals"
        ? colors.primaryForeground
        : variant === "function"
          ? colors.secondaryForeground
          : colors.foreground;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        wide && styles.buttonWide,
        {
          backgroundColor,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
      hitSlop={4}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: textColor,
            fontSize: variant === "digit" || variant === "function" ? 26 : 30,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  displaySection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  expressionScroll: {
    maxHeight: 28,
    flexGrow: 0,
  },
  expressionText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "right",
  },
  resultScroll: {
    maxHeight: 84,
    flexGrow: 0,
  },
  resultScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  resultText: {
    fontWeight: "600",
    textAlign: "right",
  },
  keypad: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonWide: {
    flex: 2.15,
    aspectRatio: undefined,
    borderRadius: 999,
    paddingVertical: 22,
  },
  buttonText: {
    fontWeight: "600",
  },
});
