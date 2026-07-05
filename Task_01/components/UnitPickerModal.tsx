import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import type { UnitDef } from "@/constants/units";

interface UnitPickerModalProps {
  visible: boolean;
  title: string;
  units: UnitDef[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function UnitPickerModal({
  visible,
  title,
  units,
  selectedId,
  onSelect,
  onClose,
}: UnitPickerModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: colors.radius,
              borderTopRightRadius: colors.radius,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            {title}
          </Text>
          <FlatList
            data={units}
            keyExtractor={(item) => item.id}
            scrollEnabled={units.length > 6}
            style={styles.list}
            renderItem={({ item }) => {
              const active = item.id === selectedId;
              return (
                <Pressable
                  testID={`unit-option-${item.id}`}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  style={[
                    styles.row,
                    active && { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      {
                        color: active ? colors.primary : colors.foreground,
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <View style={styles.rowRight}>
                    <Text
                      style={[
                        styles.rowSymbol,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.symbol}
                    </Text>
                    {active && (
                      <Feather name="check" size={18} color={colors.primary} />
                    )}
                  </View>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,17,21,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "70%",
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d0d2e0",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  list: {
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowLabel: {
    fontSize: 16,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowSymbol: {
    fontSize: 14,
  },
});
