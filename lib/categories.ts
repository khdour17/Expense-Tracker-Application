// lib/categories.ts
export type Category = {
  id: string;
  name: string;
  emoji: string;
  defaultBudget?: number; // optional suggested per-category budget
};

export const CATEGORIES: Category[] = [
  { id: "rent", name: "Rent", emoji: "🏠", defaultBudget: 1500 },
  { id: "food", name: "Food", emoji: "🍔", defaultBudget: 400 },
  { id: "transport", name: "Transport", emoji: "🚕", defaultBudget: 150 },
  { id: "shopping", name: "Shopping", emoji: "🛍️", defaultBudget: 200 },
  { id: "utilities", name: "Utilities", emoji: "💡", defaultBudget: 120 },
  { id: "entertainment", name: "Entertainment", emoji: "🎬", defaultBudget: 100 },
  { id: "health", name: "Health", emoji: "💊", defaultBudget: 80 },
  { id: "misc", name: "Miscellaneous", emoji: "📦", defaultBudget: 100 },
];
