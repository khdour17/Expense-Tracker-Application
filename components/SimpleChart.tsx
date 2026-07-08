// components/SimpleChart.tsx
// Very simple horizontal bar chart component for category usage.
// Not a real chart library — just simple colored bars for demo.

import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  items: { label: string; value: number; color?: string }[];
  max?: number;
};

export default function SimpleChart({ items, max }: Props) {
  const computedMax = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <View>
      {items.map((it) => {
        const pct = Math.min(100, (it.value / computedMax) * 100);
        return (
          <View key={it.label} style={{ marginBottom: 8 }}>
            <Text style={styles.label}>
              {it.label} — {it.value.toFixed(0)}
            </Text>
            <View style={styles.barBg}>
              <View style={[styles.bar, { width: `${pct}%`, backgroundColor: it.color ?? "#3b82f6" }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "600", marginBottom: 4 },
  barBg: {
    height: 12,
    backgroundColor: "#e6eefb",
    borderRadius: 8,
    overflow: "hidden",
  },
  bar: {
    height: 12,
    borderRadius: 8,
  },
});
