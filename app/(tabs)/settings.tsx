// app/(tabs)/settings.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/theme";
import { readSettings, writeSettings } from "../../lib/storage";

// Popular currencies with symbols
const CURRENCIES = [
  { id: "ils", symbol: "₪", name: "Israeli Shekel (ILS)" },
  { id: "usd", symbol: "$", name: "US Dollar (USD)" },
  { id: "eur", symbol: "€", name: "Euro (EUR)" },
  { id: "gbp", symbol: "£", name: "British Pound (GBP)" },
  { id: "jpy", symbol: "¥", name: "Japanese Yen (JPY)" },
  { id: "sar", symbol: "﷼", name: "Saudi Riyal (SAR)" },
  { id: "aed", symbol: "د.إ", name: "UAE Dirham (AED)" },
  { id: "inr", symbol: "₹", name: "Indian Rupee (INR)" },
  { id: "aud", symbol: "A$", name: "Australian Dollar (AUD)" },
  { id: "cad", symbol: "C$", name: "Canadian Dollar (CAD)" },
  { id: "chf", symbol: "CHF", name: "Swiss Franc (CHF)" },
];

export default function SettingsScreen() {
  // Track selected currency
  const [selectedCurrency, setSelectedCurrency] = useState("₪");

  // Load settings when screen mounts or comes into focus
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await readSettings();
        setSelectedCurrency(s.currencySymbol);
      })();
    }, [])
  );

  // Save all settings to storage
  async function save() {
    await writeSettings({
      currencySymbol: selectedCurrency,
    });
    Alert.alert("Success", "Settings saved successfully!");
  }

  // Reset app data (confirmation required)
  function handleResetData() {
    Alert.alert(
      "Reset App Data",
      "Are you sure? This will delete all expenses and budgets. This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete All Data",
          onPress: async () => {
            try {
              const AsyncStorage = require("@react-native-async-storage/async-storage").default;
              await AsyncStorage.multiRemove(["expenses_v2", "budgets_v2", "settings_v2"]);
              await writeSettings({
                currencySymbol: "₪",
              });
              Alert.alert("Reset Complete", "All app data has been deleted.");
              setSelectedCurrency("₪");
            } catch (error) {
              Alert.alert("Error", "Failed to reset app data.");
            }
          },
          style: "destructive",
        },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.title}>⚙️ Settings</Text>

      {/* Currency Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💱 Currency</Text>
        <Text style={styles.sectionDescription}>
          Choose your preferred currency for displaying amounts
        </Text>

        {/* Preset Currency Options */}
        <View style={styles.currencyGrid}>
          {CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr.id}
              style={[
                styles.currencyButton,
                selectedCurrency === curr.symbol
                  ? styles.currencyButtonActive
                  : {},
              ]}
              onPress={() => {
                setSelectedCurrency(curr.symbol);
              }}
            >
              <Text style={styles.currencySymbol}>{curr.symbol}</Text>
              <Text style={styles.currencyName}>{curr.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>

      {/* App Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ App Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Developer</Text>
          <Text style={styles.infoValue}>Ali Khdour</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
        </View>
        
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Data Management</Text>

        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={handleResetData}
        >
          <Text style={styles.deleteButtonText}>🗑️ Reset All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>✓ Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 20,
  },
  section: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Colors.shadows.soft,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  currencyButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: Colors.background.secondary,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
  },
  currencyButtonActive: {
    borderColor: Colors.primary.green,
    backgroundColor: Colors.primary.green + "20",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary.blue,
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  customCurrencyContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    padding: 12,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  customCurrencyInput: {
    borderWidth: 1.5,
    borderColor: Colors.background.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: Colors.background.primary,
  },
  customCurrencyInputActive: {
    borderColor: Colors.primary.green,
    backgroundColor: Colors.primary.green + "10",
  },
  customCurrencyText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  infoFooter: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 12,
    fontStyle: "italic",
    paddingHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: Colors.status.error + "20",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.status.error,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.status.error,
  },
  saveBtn: {
    backgroundColor: Colors.primary.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    ...Colors.shadows.soft,
  },
  saveBtnText: {
    color: Colors.text.white,
    fontWeight: "800",
    fontSize: 16,
  },
});
