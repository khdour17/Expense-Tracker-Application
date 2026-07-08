// app/addBudget.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/theme";
import { CATEGORIES } from "../lib/categories";
import { getBudgetForMonth, readSettings, setBudgetForMonth } from "../lib/storage";

export default function AddBudget() {
  const router = useRouter();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  });
  const [total, setTotal] = useState("");
  const [perCategory, setPerCategory] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("₪");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await readSettings();
        setCurrency(s.currencySymbol);
      })();
    }, [])
  );

  useEffect(() => {
    (async () => {
      const b = await getBudgetForMonth(month);
      if (b) {
        setTotal(String(b.totalLimit));
        const obj: Record<string, string> = {};
        Object.entries(b.perCategory || {}).forEach(([k, v]) => (obj[k] = String(v)));
        setPerCategory(obj);
      } else {
        // fill defaults from categories
        const obj: Record<string, string> = {};
        CATEGORIES.forEach((c) => {
          if (c.defaultBudget) obj[c.id] = String(c.defaultBudget);
        });
        setPerCategory(obj);
        setTotal("");
      }
    })();
  }, [month]);

  async function save() {
    const t = Number(total);
    if (isNaN(t) || t <= 0) {
      Alert.alert("Invalid total budget", "Enter a valid number for total budget.");
      return;
    }
    const parsedPer: Record<string, number> = {};
    for (const k of Object.keys(perCategory)) {
      const v = Number(perCategory[k]);
      if (!isNaN(v) && v > 0) parsedPer[k] = v;
    }
    
    setLoading(true);
    try {
      await setBudgetForMonth({
        id: `b-${month}`,
        month,
        totalLimit: t,
        perCategory: parsedPer,
      });
      Alert.alert("Success", "Budget saved successfully!", [
        { 
          text: "OK", 
          onPress: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            router.dismiss();
          } 
        },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save budget. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Month</Text>
          <TextInput
            value={month}
            onChangeText={setMonth}
            style={styles.input}
            placeholder="YYYY-MM"
            placeholderTextColor={Colors.text.light}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Total Budget</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              value={total}
              onChangeText={setTotal}
              keyboardType="numeric"
              style={styles.inputWithSymbol}
              placeholder="2000"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Category Budgets</Text>
          <Text style={styles.sublabel}>Set a budget limit for each category</Text>

          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((c) => (
              <View key={c.id}>
                <View style={styles.categoryRowHeader}>
                  <Text style={styles.emoji}>{c.emoji}</Text>
                  <Text style={styles.categoryName}>{c.name}</Text>
                </View>
                <View style={styles.categoryRowInput}>
                  <Text style={styles.currencySymbol}>{currency}</Text>
                  <TextInput
                    value={perCategory[c.id]}
                    onChangeText={(v) =>
                      setPerCategory((prev) => ({ ...prev, [c.id]: v }))
                    }
                    keyboardType="numeric"
                    style={styles.inputAmount}
                    placeholder="0"
                    placeholderTextColor={Colors.text.light}
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={save}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? "Saving..." : "Save Budget"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 18,
    ...Colors.shadows.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1.5,
    borderColor: Colors.primary.blue,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderWidth: 1.5,
    borderColor: Colors.primary.blue,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary.green,
    marginRight: 6,
  },
  inputWithSymbol: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 11,
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  inputSmall: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 11,
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "500",
    borderWidth: 1.5,
    borderColor: Colors.primary.blue,
    borderRadius: 10,
    backgroundColor: Colors.background.primary,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginTop: 12,
    gap: 16,
  },
  categoryRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  categoryRowInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.background.primary,
  },
  emoji: {
    fontSize: 28,
    minWidth: 32,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
  },
  inputAmount: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 11,
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "500",
    borderWidth: 1.5,
    borderColor: Colors.primary.blue,
    borderRadius: 8,
    backgroundColor: Colors.background.primary,
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: Colors.primary.green,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    ...Colors.shadows.soft,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.text.white,
    fontWeight: "800",
    fontSize: 16,
  },
});

