// lib/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // ISO
  notes?: string;
  createdAt: number;
  receiptUri?: string;
};

export type Budget = {
  id: string;
  month: string; // YYYY-MM
  totalLimit: number;
  perCategory: Record<string, number>; // categoryId -> limit
};

export type AppSettings = {
  currencySymbol: string;
  notificationsEnabled?: boolean;
};

const EXPENSES_KEY = "expenses_v2";
const BUDGETS_KEY = "budgets_v2";
const SETTINGS_KEY = "settings_v2";

/* Expenses */
export async function readExpenses(): Promise<Expense[]> {
  try {
    const json = await AsyncStorage.getItem(EXPENSES_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("readExpenses failed", e);
    return [];
  }
}

export async function writeExpenses(expenses: Expense[]) {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.warn("writeExpenses failed", e);
  }
}

export async function addExpense(expense: Expense) {
  const all = await readExpenses();
  await writeExpenses([expense, ...all]);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const list = await readExpenses();
  return list.find((x) => x.id === id) ?? null;
}

export async function deleteExpense(id: string) {
  const list = await readExpenses();
  await writeExpenses(list.filter((x) => x.id !== id));
}

/* Budgets */
export async function readBudgets(): Promise<Budget[]> {
  try {
    const json = await AsyncStorage.getItem(BUDGETS_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("readBudgets failed", e);
    return [];
  }
}

export async function writeBudgets(budgets: Budget[]) {
  try {
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (e) {
    console.warn("writeBudgets failed", e);
  }
}

export async function setBudgetForMonth(budget: Budget) {
  const all = await readBudgets();
  const other = all.filter((b) => b.month !== budget.month);
  await writeBudgets([budget, ...other]);
}

export async function getBudgetForMonth(month: string): Promise<Budget | null> {
  const all = await readBudgets();
  return all.find((b) => b.month === month) ?? null;
}

/* Settings */
export async function readSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!json) return { currencySymbol: "₪" };
    return JSON.parse(json);
  } catch (e) {
    console.warn("readSettings failed", e);
    return { currencySymbol: "₪" };
  }
}

export async function writeSettings(s: AppSettings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn("writeSettings failed", e);
  }
}
