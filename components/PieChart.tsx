// components/PieChart.tsx
// Simple pie chart component for visualizing budget and spending distribution

import React from "react";
import { StyleSheet, Text, View } from "react-native";

type PieItem = {
  label: string;
  value: number;
  color?: string;
  categoryId?: string;
};

type Props = {
  items: PieItem[];
  size?: number;
  currency?: string;
};

/**
 * Simple pie chart that displays budget or spending distribution
 * Uses SVG-like implementation for visualization with multi-color palette
 * @param items - Array of data items with label, value, and optional color
 * @param size - Diameter of the pie chart in pixels (default: 200)
 */
export default function PieChart({ items, size = 200, currency = "₪" }: Props) {
  // Filter out zero values for cleaner display
  const validItems = items.filter((i) => i.value > 0);
  
  if (validItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  // Calculate total for percentages
  const total = validItems.reduce((sum, item) => sum + item.value, 0);

  // Enhanced color palette with more vibrant and distinct colors
  const defaultColors = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#A855F7", // Violet
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#8B5CF6", // Purple
    "#14B8A6", // Teal
    "#6366F1", // Indigo
    "#D97706", // Amber
  ];

  // Generate pie slices using a simple circle drawing approach
  // We'll use rotation transforms to create the visual pie effect
  const radius = size / 2;
  let currentAngle = -90; // Start at top

  return (
    <View style={styles.container}>
      {/* Pie Chart Visual Container */}
      <View
        style={[
          styles.pieContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {validItems.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const color = item.color || defaultColors[index % defaultColors.length];

          // Create a colored circle segment using border radius trick
          // This is a simplified pie chart representation
          const sliceStyle = {
            position: "absolute" as const,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: 0.85,
          };

          currentAngle += angle;

          return (
            <View
              key={item.label}
              style={[
                sliceStyle,
                {
                  transform: [
                    {
                      rotate: `${currentAngle - angle}deg`,
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {validItems.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          const color = item.color || defaultColors[index % defaultColors.length];

          return (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: color },
                ]}
              />
              <View style={styles.legendContent}>
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendValue}>
                  {currency}{item.value.toFixed(2)} ({percentage}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Center Text - Total */}
      <View style={[styles.centerText, { width: size, height: size }]}>
        <Text style={styles.centerValue}>{currency}{total.toFixed(2)}</Text>
        <Text style={styles.centerLabel}>Total</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
  },
  pieContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    position: "relative",
    marginBottom: 24,
  },
  centerText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  centerValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
  },
  centerLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  legend: {
    width: "100%",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  legendValue: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
});
