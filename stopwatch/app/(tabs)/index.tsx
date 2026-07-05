import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Lap = {
  id: string;
  index: number;
  lapMs: number;
  totalMs: number;
};

const TICK_MS = 30;

function formatTime(ms: number) {
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");

  if (hours > 0) {
    return {
      main: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      sub: `.${pad(centis)}`,
    };
  }
  return {
    main: `${pad(minutes)}:${pad(seconds)}`,
    sub: `.${pad(centis)}`,
  };
}

export default function StopwatchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);

  const startTimestampRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLapTotalRef = useRef(0);

  const tick = useCallback(() => {
    if (startTimestampRef.current == null) return;
    const now = Date.now();
    const current = baseElapsedRef.current + (now - startTimestampRef.current);
    setElapsedMs(current);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, TICK_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  const handleStart = useCallback(() => {
    if (isRunning) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    startTimestampRef.current = Date.now();
    setIsRunning(true);
  }, [isRunning]);

  const handlePause = useCallback(() => {
    if (!isRunning || startTimestampRef.current == null) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const now = Date.now();
    baseElapsedRef.current += now - startTimestampRef.current;
    startTimestampRef.current = null;
    setElapsedMs(baseElapsedRef.current);
    setIsRunning(false);
  }, [isRunning]);

  const handleReset = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setIsRunning(false);
    startTimestampRef.current = null;
    baseElapsedRef.current = 0;
    lastLapTotalRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  }, []);

  const handleLap = useCallback(() => {
    if (!isRunning) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLaps((prev) => {
      const total = elapsedMs;
      const lapDuration = total - lastLapTotalRef.current;
      lastLapTotalRef.current = total;
      const next: Lap = {
        id: `${Date.now()}-${prev.length}`,
        index: prev.length + 1,
        lapMs: lapDuration,
        totalMs: total,
      };
      return [next, ...prev];
    });
  }, [elapsedMs, isRunning]);

  const canReset = !isRunning && elapsedMs > 0;
  const time = formatTime(elapsedMs);

  const fastestLapMs =
    laps.length > 1 ? Math.min(...laps.map((l) => l.lapMs)) : null;
  const slowestLapMs =
    laps.length > 1 ? Math.max(...laps.map((l) => l.lapMs)) : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: isWeb ? 67 : insets.top,
          paddingBottom: isWeb ? 34 : insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>
          STOPWATCH
        </Text>
      </View>

      <View style={styles.displayWrap}>
        <View
          style={[
            styles.dialOuter,
            {
              borderColor: isRunning ? colors.primary : colors.border,
            },
          ]}
        >
          <View style={styles.timeRow}>
            <Text style={[styles.timeMain, { color: colors.foreground }]}>
              {time.main}
            </Text>
            <Text style={[styles.timeSub, { color: colors.mutedForeground }]}>
              {time.sub}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isRunning
                  ? colors.accent
                  : colors.secondary,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isRunning
                    ? colors.primary
                    : colors.mutedForeground,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: isRunning
                    ? colors.primary
                    : colors.mutedForeground,
                },
              ]}
            >
              {isRunning ? "Running" : elapsedMs > 0 ? "Paused" : "Ready"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          testID="reset-button"
          disabled={!canReset}
          onPress={handleReset}
          style={({ pressed }) => [
            styles.sideButton,
            {
              backgroundColor: colors.secondary,
              opacity: !canReset ? 0.35 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="rotate-ccw" size={22} color={colors.foreground} />
          <Text style={[styles.sideButtonLabel, { color: colors.foreground }]}>
            Reset
          </Text>
        </Pressable>

        <Pressable
          testID={isRunning ? "pause-button" : "start-button"}
          onPress={isRunning ? handlePause : handleStart}
          style={({ pressed }) => [
            styles.mainButton,
            {
              backgroundColor: isRunning
                ? colors.destructive
                : colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather
            name={isRunning ? "pause" : "play"}
            size={30}
            color={isRunning ? colors.destructiveForeground : colors.primaryForeground}
          />
        </Pressable>

        <Pressable
          testID="lap-button"
          disabled={!isRunning}
          onPress={handleLap}
          style={({ pressed }) => [
            styles.sideButton,
            {
              backgroundColor: colors.secondary,
              opacity: !isRunning ? 0.35 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="flag" size={22} color={colors.foreground} />
          <Text style={[styles.sideButtonLabel, { color: colors.foreground }]}>
            Lap
          </Text>
        </Pressable>
      </View>

      <View style={styles.lapsSection}>
        {laps.length > 0 ? (
          <View style={styles.lapsHeaderRow}>
            <Text style={[styles.lapsTitle, { color: colors.foreground }]}>
              Laps
            </Text>
            <Text style={[styles.lapsCount, { color: colors.mutedForeground }]}>
              {laps.length}
            </Text>
          </View>
        ) : null}

        <FlatList
          data={laps}
          keyExtractor={(item) => item.id}
          scrollEnabled={laps.length > 0}
          contentContainerStyle={
            laps.length === 0 ? styles.emptyListContent : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="flag" size={26} color={colors.mutedForeground} />
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                Laps will appear here while the stopwatch is running
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const lapTime = formatTime(item.lapMs);
            const totalTime = formatTime(item.totalMs);
            const isFastest = item.lapMs === fastestLapMs;
            const isSlowest = item.lapMs === slowestLapMs;
            return (
              <View
                style={[
                  styles.lapRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.lapIndexBadge,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.lapIndexText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.index}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.lapDuration,
                    {
                      color: isFastest
                        ? colors.primary
                        : isSlowest
                          ? colors.destructive
                          : colors.foreground,
                    },
                  ]}
                >
                  {lapTime.main}
                  {lapTime.sub}
                </Text>
                <Text
                  style={[styles.lapTotal, { color: colors.mutedForeground }]}
                >
                  {totalTime.main}
                  {totalTime.sub}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
  },
  displayWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  dialOuter: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 2,
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  timeMain: {
    fontSize: 56,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  timeSub: {
    fontSize: 26,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  mainButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  sideButton: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  sideButtonLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  lapsSection: {
    flex: 1,
  },
  lapsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  lapsTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  lapsCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    gap: 8,
    paddingBottom: 12,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  lapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  lapIndexBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  lapIndexText: {
    fontSize: 12,
    fontWeight: "700",
  },
  lapDuration: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  lapTotal: {
    fontSize: 13,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
});
