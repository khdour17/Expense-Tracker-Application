# ExpenseTracker

A modern Expo + React Native expense tracker for mobile and web. ExpenseTracker lets you record spending, set monthly budgets, review category breakdowns, and generate smart spending insights without needing a backend.

## What it does

- Track expenses with title, amount, category, notes, and optional receipt photos.
- Set monthly budgets with both a total limit and per-category limits.
- Review your dashboard for current month spending, budget progress, top category, and recent transactions.
- Browse all expenses with month/all-time filtering and tap into full expense details.
- Generate local spending insights and budget warnings from your saved data.
- Customize the currency symbol and reset stored app data from Settings.

## Screens

- Dashboard: monthly totals, budget progress, top category, and recent activity.
- Expenses: sortable expense list with current-month or all-time filtering.
- Budget: monthly summary plus budget allocation and actual spending charts.
- Insights: generated spending analysis, warnings, and category breakdowns.
- Settings: currency selection and data reset controls.
- Add Expense: form with category picker, notes, camera/gallery receipt support.
- Add Budget: month-based budget editor with per-category limits.
- Expense Details: full record view with photo, notes, and delete action.

## Key features

- Local-first storage with AsyncStorage; no server required.
- Expo Router navigation with modal flows for adding expenses and budgets.
- Receipt capture from the device camera or photo library.
- Category-based budgets and spending analysis.
- Visual charts and progress indicators for budget tracking.
- Currency-aware totals across the app.

## Tech stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- AsyncStorage
- Expo Image Picker
- React Navigation

## Getting started

### Prerequisites

- Node.js and npm
- Expo CLI support through `npx`

### Install

```bash
npm install
```

### Run locally

```bash
npm start
```

You can then open the app in:

- Expo Go
- iOS simulator
- Android emulator
- Web browser

### Other useful commands

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Project structure

- `app/` - Expo Router screens and navigation
- `components/` - shared UI pieces and charts
- `constants/` - theme and design tokens
- `lib/` - local storage, categories, and insight logic
- `assets/` - static images

## Data model

- Expenses are stored locally with id, title, amount, category, date, notes, createdAt, and optional receiptUri.
- Budgets are stored by month with a total limit and per-category limits.
- Settings currently store the selected currency symbol.

## Publishing notes

- This project is ready to publish as a GitHub repository with a single README.
- If you want screenshots in the repo, add them under `assets/` and reference them here.
- Because all data is local, users can try the app immediately after install with no backend setup.

## App highlights

- Dashboard summary with budget awareness.
- Spend analysis by category.
- Receipt photo support for expenses.
- Clean, lightweight UI built for quick mobile entry.

## License

Add your preferred license before publishing if you want the repository to be reusable by others.
