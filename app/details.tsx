import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { CATEGORIES } from "../lib/categories";
import { deleteExpense, Expense, getExpenseById, readSettings } from "../lib/storage";
export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("₪");

  useEffect(() => {
    (async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const e = await getExpenseById(id);
      const settings = await readSettings();
      setExpense(e);
      setCurrency(settings.currencySymbol);
      setLoading(false);
    })();
  }, [id]);

  async function handleDelete() {
    Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          await deleteExpense(id);
          router.replace("/(tabs)/expenses");
        },
      },
    ]);
  }

  if (loading)
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
          <Text style={[styles.loadingText, { marginTop: 12 }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );

  if (!expense)
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>❌</Text>
          <Text style={styles.emptyText}>Expense not found</Text>
        </View>
      </SafeAreaView>
    );

  const category = CATEGORIES.find((c) => c.id === expense.category);
  const createdDate = new Date(expense.date);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Expense Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.largeEmoji}>{category?.emoji || "📂"}</Text>
          </View>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.amount}>{currency}{expense.amount.toFixed(2)}</Text>
          <Text style={styles.date}>{createdDate.toLocaleString()}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeEmoji}>{category?.emoji || "📂"}</Text>
              <Text style={styles.badgeText}>{expense.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {createdDate.toLocaleDateString()} at{" "}
              {createdDate.toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.amountDisplay}>{currency}{expense.amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Receipt Section */}
        {expense.receiptUri && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Receipt Photo</Text>
            <Image
              source={{ uri: expense.receiptUri }}
              style={styles.receipt}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Notes Section */}
        {expense.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{expense.notes}</Text>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
        >
          <Text style={styles.deleteBtnText}>🗑️ Delete Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  backBtn: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  backBtnText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    ...Colors.shadows.medium,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  largeEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  amount: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.primary.green,
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    ...Colors.shadows.soft,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.secondary,
    marginVertical: 12,
  },
  amountDisplay: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary.green,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  receipt: {
    width: "100%",
    height: 300,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  deleteBtn: {
    backgroundColor: Colors.status.error,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    ...Colors.shadows.soft,
  },
  deleteBtnText: {
    color: Colors.text.white,
    fontWeight: "800",
    fontSize: 16,
  },
});
