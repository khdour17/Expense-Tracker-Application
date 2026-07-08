// components/CategoryPicker.tsx
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CATEGORIES } from "../lib/categories";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export default function CategoryPicker({ value, onChange }: Props) {
  return (
    <FlatList
      data={CATEGORIES}
      keyExtractor={(i) => i.id}
      numColumns={4}
      scrollEnabled={false}
      columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
      renderItem={({ item }) => {
        const selected = item.id === value;
        return (
          <TouchableOpacity style={[styles.cell, selected ? styles.selected : undefined]} onPress={() => onChange(item.id)}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    width: "23%",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selected: {
    backgroundColor: "#e6eefb",
    borderColor: "#3b82f6",
  },
  emoji: { fontSize: 20 },
  label: { fontSize: 11, marginTop: 6, textAlign: "center" },
});
