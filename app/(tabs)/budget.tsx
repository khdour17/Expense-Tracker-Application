import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PieChart from "../../components/PieChart";
import { Colors } from "../../constants/theme";
import { CATEGORIES } from "../../lib/categories";
import { readBudgets, readExpenses, readSettings } from "../../lib/storage";

export default function BudgetScreen() {
  const [budget, setBudget] = useState<any>(null);
  const [spendingByCategory, setSpendingByCategory] = useState<{ label: string; value: number; categoryId: string }[]>([]);
  const [budgetByCategory, setBudgetByCategory] = useState<{ label: string; value: number; categoryId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("₪");
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const settings = await readSettings();
          setCurrency(settings.currencySymbol);

          const b = await readBudgets();
          const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}`;
          const found = b.find((x: any) => x.month === thisMonth);
          setBudget(found ?? null);

          const expenses = await readExpenses();
          const spendingMap: Record<string, number> = {};
          expenses.forEach((e) => {
            const d = new Date(e.date);
            const m = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
            if (m === thisMonth) spendingMap[e.category] = (spendingMap[e.category] || 0) + e.amount;
          });
          const spendingData = Object.entries(spendingMap)
            .map(([categoryId, value]) => {
              const cat = CATEGORIES.find(c => c.id === categoryId);
              return { 
                label: cat?.name || categoryId, 
                value,
                categoryId
              };
            })
            .sort((a, b) => b.value - a.value);
          setSpendingByCategory(spendingData);

          if (found) {
            const budgetData = CATEGORIES
              .filter((c) => (found.perCategory?.[c.id] ?? 0) > 0)
              .map((c) => ({
                label: c.name,
                value: found.perCategory?.[c.id] ?? 0,
                categoryId: c.id,
              }))
              .sort((a, b) => b.value - a.value);
            setBudgetByCategory(budgetData);
          }
        } catch (error) {
          console.error("Error loading budget data:", error);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.blue} />
      </View>
    );
  }

  const totalSpent = spendingByCategory.reduce((s, i) => s + i.value, 0);
  const percentageUsed = budget ? (totalSpent / budget.totalLimit) * 100 : 0;

  const renderHeader = () => {
    if (!budget) {
      return (
        <View style={styles.noBudgetSection}>
          <Text style={styles.noBudgetEmoji}>📊</Text>
          <Text style={styles.noBudgetTitle}>No Budget Set</Text>
          <Text style={styles.noBudgetSubtext}>Create a budget to start tracking your spending</Text>
        </View>
      );
    }

    return (
      <>
        {/* Header Title */}
        <Text style={styles.screenTitle}>💰 Budget Overview</Text>

        {/* Main Summary Card */}
        <View style={styles.mainSummaryCard}>
          <View style={styles.summaryGridRow}>
            <View style={styles.summaryGridItem}>
              <Text style={styles.summaryGridLabel}>Total Budget</Text>
              <Text style={styles.summaryGridValue}>{currency}{budget.totalLimit.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryGridDivider} />
            <View style={styles.summaryGridItem}>
              <Text style={styles.summaryGridLabel}>Spent</Text>
              <Text style={[
                styles.summaryGridValue,
                { color: totalSpent > budget.totalLimit ? Colors.status.error : Colors.primary.green }
              ]}>
                {currency}{totalSpent.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryGridDivider} />
            <View style={styles.summaryGridItem}>
              <Text style={styles.summaryGridLabel}>Remaining</Text>
              <Text style={[
                styles.summaryGridValue,
                { color: Math.max(0, budget.totalLimit - totalSpent) > 0 ? Colors.primary.green : Colors.status.error }
              ]}>
                {currency}{Math.max(0, budget.totalLimit - totalSpent).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressLabel}>Budget Used</Text>
              <Text style={styles.progressPercentage}>{percentageUsed.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(percentageUsed, 100)}%`,
                    backgroundColor: percentageUsed > 90 
                      ? Colors.status.error 
                      : percentageUsed > 75 
                      ? Colors.status.warning 
                      : Colors.primary.green,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderFooter = () => (
    <TouchableOpacity
      style={styles.editBtn}
      onPress={() => router.push("../addBudget")}
    >
      <Text style={styles.editBtnText}>
        {budget ? "✏️ Edit Budget" : "➕ Create Budget"}
      </Text>
    </TouchableOpacity>
  );

  if (!budget) {
    return (
      <FlatList
        style={styles.container}
        data={[]}
        keyExtractor={() => "empty"}
        renderItem={() => null}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
      />
    );
  }

  const chartSections = [
    {
      title: "📊 Budget Allocation",
      subtitle: `Total: ${currency}${budgetByCategory.reduce((s, i) => s + i.value, 0).toFixed(2)}`,
      data: budgetByCategory,
    },
    {
      title: "💸 Actual Spending",
      subtitle: `Total: ${currency}${totalSpent.toFixed(2)}`,
      data: spendingByCategory,
    },
  ];

  return (
    <FlatList
      style={styles.container}
      data={chartSections}
      keyExtractor={(_, idx) => idx.toString()}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      renderItem={({ item }) => (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>{item.title}</Text>
              <Text style={styles.chartSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          {item.data.length > 0 ? (
            <PieChart items={item.data} size={180} currency={currency} />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No data yet</Text>
            </View>
          )}
        </View>
      )}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 16,
    marginTop: 8,
  },
  noBudgetSection: {
    alignItems: "center",
    paddingVertical: 60,
  },
  noBudgetEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noBudgetTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  noBudgetSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  mainSummaryCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    ...Colors.shadows.medium,
  },
  summaryGridRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  summaryGridItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryGridLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 6,
    textAlign: "center",
  },
  summaryGridValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary.blue,
    textAlign: "center",
  },
  summaryGridDivider: {
    width: 1,
    height: 45,
    backgroundColor: Colors.background.secondary,
    marginHorizontal: 8,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
    paddingTop: 16,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary.blue,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.background.secondary,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  chartCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Colors.shadows.medium,
  },
  chartHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  emptyChart: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  editBtn: {
    backgroundColor: Colors.primary.green,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    ...Colors.shadows.medium,
  },
  editBtnText: {
    color: Colors.text.white,
    fontWeight: "800",
    fontSize: 16,
  },
});
