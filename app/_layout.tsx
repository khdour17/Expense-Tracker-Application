// app/_layout.tsx
import { Stack } from "expo-router";
import { Colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary.lightBlue,
        },
        headerTintColor: Colors.primary.darkBlue,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background.primary,
        },
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="addExpense" 
        options={{ 
          title: "Add Expense",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="addBudget" 
        options={{ 
          title: "Set Budget",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="details" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
