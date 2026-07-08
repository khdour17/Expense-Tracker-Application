// components/IconButton.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function IconButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn}>
      <Text style={{ fontWeight: "700", color: "white" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: "#0f172a", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
});
