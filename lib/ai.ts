// lib/ai.ts
// Local insight generator - enhanced with better analysis
import { Budget, Expense } from "./storage";

export type Insight = { id: string; text: string; level?: "info" | "warn" | "critical"; createdAt: number };

/* Enhanced local generator with sophisticated analysis */
export function generateLocalInsights(expenses: Expense[], budgets: Budget[], month?: string): Insight[] {
  const now = Date.now();
  const targetMonth = month ?? `${new Date().getFullYear()}-${(new Date().getMonth()+1).toString().padStart(2,"0")}`;
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const m = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}`;
    return m === targetMonth;
  });

  if (monthExpenses.length === 0) {
    return [{ id: `i-${now}-0`, text: `No expenses recorded in ${targetMonth}. Start tracking your spending!`, level: "info", createdAt: now }];
  }

  const catMap: Record<string, number> = {};
  monthExpenses.forEach((e) => (catMap[e.category] = (catMap[e.category] || 0) + e.amount));
  const entries = Object.entries(catMap).sort((a,b) => b[1]-a[1]);

  const insights: Insight[] = [];

  // 1. Summary insight
  const totalSpent = monthExpenses.reduce((s, x) => s + x.amount, 0);
  const avgPerDay = (totalSpent / monthExpenses.length).toFixed(2);
  insights.push({ 
    id:`i-${now}-summary`, 
    text: `📊 Total spent: $${totalSpent.toFixed(2)} across ${monthExpenses.length} expenses (avg $${avgPerDay}/expense)`, 
    level: "info", 
    createdAt: now 
  });

  // 2. Top category insight
  if (entries.length > 0) {
    const [topCat, topAmt] = entries[0];
    const percentage = ((topAmt / totalSpent) * 100).toFixed(1);
    insights.push({ 
      id:`i-${now}-top`, 
      text: `🔝 Highest spending: ${topCat} at $${topAmt.toFixed(2)} (${percentage}% of total)`, 
      level: "info", 
      createdAt: now 
    });
  }

  // 3. Budget analysis
  const budget = budgets.find((b) => b.month === targetMonth);
  if (budget) {
    const pct = (totalSpent / Math.max(1, budget.totalLimit)) * 100;
    let budgetLevel: "info" | "warn" | "critical" = "info";
    let budgetMsg = "";
    
    if (pct >= 100) {
      budgetLevel = "critical";
      budgetMsg = `⚠️ OVER BUDGET by $${(totalSpent - budget.totalLimit).toFixed(2)}!`;
    } else if (pct >= 90) {
      budgetLevel = "critical";
      budgetMsg = `🔴 Alert: ${pct.toFixed(0)}% of budget spent, only $${(budget.totalLimit - totalSpent).toFixed(2)} remaining!`;
    } else if (pct >= 75) {
      budgetLevel = "warn";
      budgetMsg = `🟡 Warning: ${pct.toFixed(0)}% of budget used, $${(budget.totalLimit - totalSpent).toFixed(2)} left`;
    } else {
      budgetMsg = `✅ On track: ${pct.toFixed(0)}% of budget ($${totalSpent.toFixed(2)}/$${budget.totalLimit.toFixed(2)})`;
    }
    
    insights.push({ id:`i-${now}-budget`, text: budgetMsg, level: budgetLevel, createdAt: now });

    // 4. Category-specific budget alerts
    for (const [cat, amt] of entries) {
      const limit = budget.perCategory?.[cat];
      if (limit && limit > 0) {
        const per = (amt / limit) * 100;
        if (per >= 100) {
          insights.push({ 
            id:`i-${now}-over-${cat}`, 
            text: `❌ ${cat}: $${amt.toFixed(2)} exceeds limit of $${limit.toFixed(2)} by ${(per - 100).toFixed(0)}%`, 
            level: "critical", 
            createdAt: now 
          });
        } else if (per >= 85) {
          insights.push({ 
            id:`i-${now}-near-${cat}`, 
            text: `⚠️ ${cat}: ${per.toFixed(0)}% of budget used ($${amt.toFixed(2)}/$${limit.toFixed(2)})`, 
            level: "warn", 
            createdAt: now 
          });
        }
      }
    }
  } else {
    insights.push({ 
      id:`i-${now}-nobudget`, 
      text: `💡 Tip: Create a budget for ${targetMonth} to get better spending insights and alerts`, 
      level: "info", 
      createdAt: now 
    });
  }

  // 5. Spending pattern insight
  const dayMap: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    const day = new Date(e.date).toLocaleDateString();
    dayMap[day] = (dayMap[day] || 0) + e.amount;
  });
  const topDay = Object.entries(dayMap).sort((a,b) => b[1]-a[1])[0];
  if (topDay) {
    insights.push({ 
      id:`i-${now}-peak`, 
      text: `📅 Peak spending day: ${topDay[0]} ($${topDay[1].toFixed(2)})`, 
      level: "info", 
      createdAt: now 
    });
  }

  // 6. Recommendations based on spending
  if (entries.length >= 3) {
    const top3Total = entries.slice(0, 3).reduce((s, [, amt]) => s + amt, 0);
    const top3Pct = ((top3Total / totalSpent) * 100).toFixed(0);
    insights.push({ 
      id:`i-${now}-rec1`, 
      text: `💡 Your top 3 categories account for ${top3Pct}% of spending. Consider setting limits.`, 
      level: "info", 
      createdAt: now 
    });
  }

  // 7. Frequency insight
  const expenseCount = monthExpenses.length;
  if (expenseCount > 0) {
    const daysWithExpenses = new Set(monthExpenses.map(e => new Date(e.date).toLocaleDateString())).size;
    const frequencyPerDay = (expenseCount / daysWithExpenses).toFixed(1);
    insights.push({ 
      id:`i-${now}-freq`, 
      text: `📈 You made an average of ${frequencyPerDay} transactions per active day`, 
      level: "info", 
      createdAt: now 
    });
  }

  return insights;
}
