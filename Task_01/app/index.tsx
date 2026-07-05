import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategorySelector } from "@/components/CategorySelector";
import { Toast } from "@/components/Toast";
import { UnitPickerModal } from "@/components/UnitPickerModal";
import { useColors } from "@/hooks/useColors";
import {
  type CategoryId,
  convertValue,
  formatResult,
  getCategory,
} from "@/constants/units";

type ActivePicker = "from" | "to" | null;

export default function ConverterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState<CategoryId>("length");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const categoryDef = useMemo(() => getCategory(category), [category]);

  const [fromUnitId, setFromUnitId] = useState(categoryDef.units[0].id);
  const [toUnitId, setToUnitId] = useState(categoryDef.units[1].id);

  function handleCategoryChange(nextCategory: CategoryId) {
    const nextDef = getCategory(nextCategory);
    setCategory(nextCategory);
    setFromUnitId(nextDef.units[0].id);
    setToUnitId(nextDef.units[1]?.id ?? nextDef.units[0].id);
    setResult(null);
  }

  function handleSwap() {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
    setResult(null);
  }

  function handleConvert() {
    const trimmed = inputValue.trim();

    if (trimmed.length === 0) {
      setToastMessage("Enter a value to convert");
      setResult(null);
      return;
    }

    const numericValue = Number(trimmed);

    if (Number.isNaN(numericValue)) {
      setToastMessage("Enter a valid number");
      setResult(null);
      return;
    }

    const converted = convertValue(category, fromUnitId, toUnitId, numericValue);
    setResult(formatResult(converted));
  }

  const fromUnit = categoryDef.units.find((u) => u.id === fromUnitId)!;
  const toUnit = categoryDef.units.find((u) => u.id === toUnitId)!;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Toast message={toastMessage} onHide={() => setToastMessage(null)} />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Unit Converter
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
          Convert length, weight, and temperature
        </Text>
      </View>

      <View style={styles.body}>
        <CategorySelector value={category} onChange={handleCategoryChange} />

        <View
          style={[
            styles.inputCard,
            { backgroundColor: colors.card, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
            Value
          </Text>
          <TextInput
            testID="value-input"
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              setResult(null);
            }}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            style={[styles.input, { color: colors.foreground }]}
          />
        </View>

        <View style={styles.unitsRow}>
          <Pressable
            testID="from-unit-button"
            onPress={() => setActivePicker("from")}
            style={[
              styles.unitCard,
              { backgroundColor: colors.card, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              From
            </Text>
            <Text style={[styles.unitValue, { color: colors.foreground }]} numberOfLines={1}>
              {fromUnit.label}
            </Text>
            <View style={styles.unitFooter}>
              <Text style={[styles.unitSymbol, { color: colors.primary }]}>
                {fromUnit.symbol}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>

          <Pressable
            testID="swap-button"
            onPress={handleSwap}
            style={[
              styles.swapButton,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
          >
            <Feather name="repeat" size={20} color={colors.primaryForeground} />
          </Pressable>

          <Pressable
            testID="to-unit-button"
            onPress={() => setActivePicker("to")}
            style={[
              styles.unitCard,
              { backgroundColor: colors.card, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              To
            </Text>
            <Text style={[styles.unitValue, { color: colors.foreground }]} numberOfLines={1}>
              {toUnit.label}
            </Text>
            <View style={styles.unitFooter}>
              <Text style={[styles.unitSymbol, { color: colors.primary }]}>
                {toUnit.symbol}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>

        <Pressable
          testID="convert-button"
          onPress={handleConvert}
          style={({ pressed }) => [
            styles.convertButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.convertButtonText, { color: colors.primaryForeground }]}>
            Convert
          </Text>
        </Pressable>

        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.secondary,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>
            Result
          </Text>
          <Text
            testID="result-text"
            style={[styles.resultValue, { color: colors.secondaryForeground }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {result !== null ? `${result} ${toUnit.symbol}` : `— ${toUnit.symbol}`}
          </Text>
        </View>
      </View>

      <UnitPickerModal
        visible={activePicker === "from"}
        title={`Convert from (${categoryDef.label})`}
        units={categoryDef.units}
        selectedId={fromUnitId}
        onSelect={(id) => {
          setFromUnitId(id);
          setResult(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      <UnitPickerModal
        visible={activePicker === "to"}
        title={`Convert to (${categoryDef.label})`}
        units={categoryDef.units}
        selectedId={toUnitId}
        onSelect={(id) => {
          setToUnitId(id);
          setResult(null);
        }}
        onClose={() => setActivePicker(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  inputCard: {
    padding: 18,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    fontSize: 36,
    fontWeight: "700",
    padding: 0,
  },
  unitsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  unitCard: {
    flex: 1,
    padding: 16,
  },
  unitValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  unitFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  unitSymbol: {
    fontSize: 13,
    fontWeight: "600",
  },
  swapButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  convertButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  convertButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  resultCard: {
    padding: 20,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 34,
    fontWeight: "700",
  },
});
