// components/ExpenseRow.tsx
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Expense } from "../lib/storage";

export default function ExpenseRow({ item, onPress, currency = "₪" }: { item: Expense; onPress?: () => void; currency?: string }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={styles.emojiBox}>
          <Text>{/* optionally show icon per category */}🧾</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.category} • {new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.amount}>{currency}{item.amount.toFixed(2)}</Text>
        {item.receiptUri && <Image source={{ uri: item.receiptUri }} style={styles.thumb} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#0f172a10",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emojiBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#ffffff0a", justifyContent: "center", alignItems: "center" },
  title: { fontWeight: "700" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  amount: { fontWeight: "800" },
  thumb: { width: 40, height: 28, marginTop: 6, borderRadius: 6 },
});
