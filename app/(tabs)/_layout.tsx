// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerStyle: { backgroundColor: "#e6f0ff" }, headerTitleStyle: { color: "#0f172a" } }}>
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="expenses" options={{ title: "Expenses", tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} /> }} />
      <Tabs.Screen name="budget" options={{ title: "Budget", tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="insights" options={{ title: "Insights", tabBarIcon: ({ color, size }) => <Ionicons name="bulb" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }} />
    </Tabs>
  );
}
