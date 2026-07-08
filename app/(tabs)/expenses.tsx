import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { CATEGORIES } from "../../lib/categories";
import { Expense, readExpenses, readSettings } from "../../lib/storage";

export default function ExpensesScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "month">("month");
  const [currency, setCurrency] = useState("₪");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const all = await readExpenses();
        const s = await readSettings();
        if (!active) return;

        setCurrency(s.currencySymbol);

        if (filter === "month") {
          const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;
          const filtered = all.filter((ex) => {
            const d = new Date(ex.date);
            const exMonth = `${d.getFullYear()}-${(d.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            return exMonth === thisMonth;
          });
          setExpenses(filtered.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          setExpenses(all.sort((a, b) => b.createdAt - a.createdAt));
        }
      })();
      return () => {
        active = false;
      };
    }, [filter])
  );

  async function onRefresh() {
    setRefreshing(true);
    const all = await readExpenses();
    if (filter === "month") {
      const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const filtered = all.filter((ex) => {
        const d = new Date(ex.date);
        const exMonth = `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        return exMonth === thisMonth;
      });
      setExpenses(filtered.sort((a, b) => b.createdAt - a.createdAt));
    } else {
      setExpenses(all.sort((a, b) => b.createdAt - a.createdAt));
    }
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>All Expenses</Text>
        <Text style={styles.subtitle}>Track and manage your spending</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            filter === "month" && styles.filterBtnActive,
          ]}
          onPress={() => setFilter("month")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "month" && styles.filterTextActive,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.filterBtnActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={expenses}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.blue}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/details", params: { id: item.id } })
            }
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>
                {CATEGORIES.find((c) => c.id === item.category)?.emoji ||
                  "📂"}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.expenseMeta}>
                {item.category} •{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.expenseAmount}>
              {currency}{item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No expenses found</Text>
            <Text style={styles.emptySubtext}>
              Add your first expense to get started
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.primary.blue,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
    textAlign: "center",
  },
  filterTextActive: {
    color: Colors.text.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    ...Colors.shadows.soft,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  expenseMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 14,
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
