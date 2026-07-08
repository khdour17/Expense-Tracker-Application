// app/(tabs)/index.tsx
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { CATEGORIES } from "../../lib/categories";
import { Expense, readBudgets, readExpenses, readSettings } from "../../lib/storage";

export default function Dashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [currency, setCurrency] = useState("₪");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const e = await readExpenses();
          const b = await readBudgets();
          const settings = await readSettings();
          setExpenses(e.sort((a, b) => b.createdAt - a.createdAt));
          setBudgets(b);
          setCurrency(settings.currencySymbol);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      })();
    }, [])
  );

  const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  const monthExpenses = expenses.filter((ex) => {
    const d = new Date(ex.date);
    return (
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}` ===
      thisMonth
    );
  });
  const totalThisMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const catMap: Record<string, number> = {};
  monthExpenses.forEach(
    (m) => (catMap[m.category] = (catMap[m.category] || 0) + m.amount)
  );

  const budget = budgets.find((b: any) => b.month === thisMonth);
  const budgetPercent = budget
    ? Math.min((totalThisMonth / budget.totalLimit) * 100, 100)
    : 0;

  const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.subtitle}>This Month</Text>
              <Text style={styles.big}>{currency}{totalThisMonth.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.addExpenseBtn}
              onPress={() => router.push("../../addExpense")}
            >
              <Text style={styles.addExpenseBtnText}>➕</Text>
            </TouchableOpacity>
          </View>

          {budget && (
            <View style={styles.budgetSection}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetLabel}>Budget: {currency}{budget.totalLimit.toFixed(2)}</Text>
                <Text style={styles.budgetPercent}>{budgetPercent.toFixed(0)}%</Text>
              </View>
              <View style={styles.budgetBar}>
                <View
                  style={[
                    styles.budgetBarFill,
                    {
                      width: `${budgetPercent}%`,
                      backgroundColor:
                        budgetPercent > 90
                          ? Colors.status.error
                          : budgetPercent > 75
                          ? Colors.status.warning
                          : Colors.primary.green,
                    },
                  ]}
                />
              </View>
              <Text style={styles.budgetRemaining}>
                ₪{Math.max(0, budget.totalLimit - totalThisMonth).toFixed(2)} remaining
              </Text>
            </View>
          )}

          {!budget && (
            <TouchableOpacity
              style={styles.setBudgetBtn}
              onPress={() => router.push("../../addBudget")}
            >
              <Text style={styles.setBudgetText}>Set Budget 💰</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Top Category */}
        {topCategory && (
          <View style={styles.topCategoryCard}>
            <Text style={styles.cardLabel}>Top Spending Category</Text>
            <View style={styles.topCategoryContent}>
              <Text style={styles.topCategoryEmoji}>
                {CATEGORIES.find((c) => c.id === topCategory[0])?.emoji || "📂"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.topCategoryName}>{topCategory[0]}</Text>
                <Text style={styles.topCategoryAmount}>
                  ₪{topCategory[1].toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("../../addBudget")}
          >
            <Text style={styles.actionEmoji}>🎯</Text>
            <Text style={styles.actionText}>Set Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/insights")}
          >
            <Text style={styles.actionEmoji}>💡</Text>
            <Text style={styles.actionText}>Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/expenses")}
          >
            <Text style={styles.actionEmoji}>📜</Text>
            <Text style={styles.actionText}>All Expenses</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Expenses */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {expenses.length > 5 && (
              <TouchableOpacity onPress={() => router.push("/(tabs)/expenses")}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            )}
          </View>

          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your spending
              </Text>
            </View>
          ) : (
            <FlatList
              data={expenses.slice(0, 6)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.expenseCard}
                  onPress={() =>
                    router.push({
                      pathname: "/details",
                      params: { id: item.id },
                    })
                  }
                >
                  <View style={styles.expenseIcon}>
                    <Text style={styles.expenseEmoji}>
                      {CATEGORIES.find((c) => c.id === item.category)?.emoji ||
                        "📂"}
                    </Text>
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseTitle}>{item.title}</Text>
                    <Text style={styles.expenseCategory}>
                      {item.category} •{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmountDisplay}>
                    {currency}{item.amount.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  page: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    ...Colors.shadows.medium,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  big: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.primary.darkBlue,
  },
  addExpenseBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary.green,
    justifyContent: "center",
    alignItems: "center",
    ...Colors.shadows.soft,
  },
  addExpenseBtnText: {
    fontSize: 24,
  },
  budgetSection: {
    marginTop: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  budgetPercent: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary.blue,
  },
  budgetBar: {
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  budgetBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  budgetRemaining: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  setBudgetBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary.green,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    ...Colors.shadows.soft,
  },
  setBudgetText: {
    color: Colors.text.white,
    fontWeight: "700",
    fontSize: 14,
  },
  topCategoryCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...Colors.shadows.soft,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  topCategoryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topCategoryEmoji: {
    fontSize: 40,
  },
  topCategoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  topCategoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary.green,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Colors.shadows.soft,
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary.blue,
  },
  expenseCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...Colors.shadows.soft,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseEmoji: {
    fontSize: 24,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  expenseCategory: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  expenseAmountDisplay: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary.green,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
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
  emptySubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});
