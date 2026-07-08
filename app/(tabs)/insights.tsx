// app/(tabs)/insights.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../../constants/theme";
import { generateLocalInsights, Insight } from "../../lib/ai";
import { readBudgets, readExpenses, readSettings } from "../../lib/storage";

export default function InsightsScreen() {
  const router = useRouter();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("₪");
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, { spent: number; budget: number; percentage: number }>>({});

  useFocusEffect(
    useCallback(() => {
      generateReport();
    }, [])
  );

  async function generateReport() {
    setLoading(true);
    try {
      const expenses = await readExpenses();
      const budgets = await readBudgets();
      const s = await readSettings();
      setCurrency(s.currencySymbol);

      // Generate local insights with category analysis
      const local = generateLocalInsights(expenses, budgets);
      setInsights(local);

      // Calculate category breakdown for current month
      const currentMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}`;
      const monthlyExpenses = expenses.filter((e) => {
        const d = new Date(e.date);
        const m = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        return m === currentMonth;
      });

      const catMap: Record<string, number> = {};
      monthlyExpenses.forEach((e) => (catMap[e.category] = (catMap[e.category] || 0) + e.amount));

      const currentBudget = budgets.find((b) => b.month === currentMonth);
      const breakdown: Record<string, { spent: number; budget: number; percentage: number }> = {};

      Object.entries(catMap).forEach(([cat, spent]) => {
        const budget = currentBudget?.perCategory?.[cat] || 0;
        breakdown[cat] = {
          spent,
          budget,
          percentage: budget > 0 ? (spent / budget) * 100 : 0,
        };
      });

      setCategoryBreakdown(breakdown);
    } finally {
      setLoading(false);
    }
  }

  const renderInsightBubble = ({ item }: { item: Insight }) => {
    let backgroundColor = Colors.background.secondary;
    let borderLeftColor = Colors.primary.blue;

    if (item.level === "critical") {
      backgroundColor = Colors.status.error + "20";
      borderLeftColor = Colors.status.error;
    } else if (item.level === "warn") {
      backgroundColor = Colors.status.warning + "20";
      borderLeftColor = Colors.status.warning;
    }

    return (
      <View
        style={[
          styles.insightBubble,
          {
            backgroundColor,
            borderLeftColor,
          },
        ]}
      >
        <Text style={styles.insightText}>{item.text}</Text>
        <Text style={styles.insightTime}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  // Render category breakdown
  const renderCategoryBreakdown = () => {
    const cats = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b.spent - a.spent)
      .slice(0, 5);

    if (cats.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>📊 Top Spending Categories</Text>
        {cats.map(([cat, data]) => (
          <View key={cat} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat}</Text>
              <Text style={styles.categoryAmount}>{currency}{data.spent.toFixed(2)}</Text>
            </View>
            {data.budget > 0 && (
              <View style={styles.categoryProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(data.percentage, 100)}%`,
                        backgroundColor:
                          data.percentage > 100
                            ? Colors.status.error
                            : data.percentage > 75
                            ? Colors.status.warning
                            : Colors.primary.green,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{data.percentage.toFixed(0)}%</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render header with buttons
  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💡 Financial Insights</Text>
        <Text style={styles.subtitle}>Smart analysis of your spending patterns</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.primary.blue }]}
          onPress={generateReport}
          disabled={loading}
        >
          <Text style={styles.actionBtnText}>
            {loading ? "Analyzing..." : "📊 Refresh Report"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.primary.green }]}
          onPress={() => router.push("../addBudget")}
        >
          <Text style={styles.actionBtnText}>💰 Set Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {loading && insights.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.primary.blue}
          />
          <Text style={styles.loadingText}>Analyzing your data...</Text>
        </View>
      )}

      {/* Category Breakdown */}
      {!loading && renderCategoryBreakdown()}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Use FlatList as root container with header to show insights */}
      <FlatList
        data={insights}
        keyExtractor={(item) => item.id}
        renderItem={renderInsightBubble}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📈</Text>
              <Text style={styles.emptyText}>No insights yet</Text>
              <Text style={styles.emptySubtext}>
                Tap "Refresh Report" to analyze your spending patterns
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.background.card,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
    ...Colors.shadows.soft,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    ...Colors.shadows.soft,
  },
  actionBtnText: {
    color: Colors.text.white,
    fontWeight: "800",
    fontSize: 14,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  insightBubble: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    ...Colors.shadows.soft,
  },
  insightText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    lineHeight: 20,
  },
  insightTime: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  // Category breakdown styles
  categorySection: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    ...Colors.shadows.soft,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  categoryProgress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
    minWidth: 35,
    textAlign: "right",
  },
});
