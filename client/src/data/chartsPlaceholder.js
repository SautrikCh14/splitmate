// PLACEHOLDER DATA for the dashboard charts only.
// Replaced by backend aggregates in Phase 9. All money values are integer paise
// and represent the user's own share of spending.
export const chartsPlaceholder = {
  monthly: [
    { month: 'Jun', amount: 285000 },
    { month: 'Jul', amount: 412000 },
    { month: 'Aug', amount: 336000 },
    { month: 'Sep', amount: 498000 },
    { month: 'Oct', amount: 371000 },
    { month: 'Nov', amount: 465000 },
  ],
  // These add up to the latest month (Nov): 465000 paise.
  categories: [
    { name: 'Food', amount: 160000 },
    { name: 'Travel', amount: 120000 },
    { name: 'Accommodation', amount: 90000 },
    { name: 'Groceries', amount: 55000 },
    { name: 'Entertainment', amount: 40000 },
  ],
};