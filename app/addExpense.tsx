// app/addExpense.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CategoryPicker from "../components/CategoryPicker";
import { CATEGORIES } from "../lib/categories";
import { addExpense } from "../lib/storage";

/**
 * AddExpense screen: gallery access, static categories, richer UI
 * Allows users to create new expenses with optional receipt photos
 */
export default function AddExpense() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [notes, setNotes] = useState("");
  const [receiptUri, setReceiptUri] = useState<string | undefined>(undefined);

  // Opens device gallery to pick a receipt image
  async function openGallery() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Media library permission required to choose a receipt image. You can still save an expense without a photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!result.canceled) {
        // Store the image URI from selected image
        setReceiptUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery");
    }
  }

  // Opens device camera to take a receipt photo
  async function openCamera() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Camera permission required to take a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!result.canceled) {
        // Store the image URI from camera capture
        setReceiptUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  }

  // Validates and saves the expense to AsyncStorage
  async function handleSave() {
    try {
      const t = title.trim();
      const num = Number(amount);
      // Validate required fields
      if (!t || isNaN(num) || num <= 0) {
        Alert.alert("Invalid", "Please enter a valid title and amount.");
        return;
      }
      // Dismiss keyboard before saving
      Keyboard.dismiss();
      // Create expense object with all details
      const expense = {
        id: String(Date.now()), // Unique ID using timestamp
        title: t,
        amount: num,
        category,
        date: new Date().toISOString(), // Current date/time
        notes: notes.trim() || undefined,
        createdAt: Date.now(),
        receiptUri, // Image URI will be saved to AsyncStorage
      };
      // Save expense to device storage
      await addExpense(expense);
      Alert.alert("Success", "Expense saved!");
      // Dismiss the modal and return to expenses screen
      router.dismiss();
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save expense");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ScrollView with keyboard-dismissing on scroll */}
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        <Text style={styles.heading}>Add Expense</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Amount</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#94a3b8" />

          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Groceries" placeholderTextColor="#94a3b8" />

          <Text style={styles.label}>Category</Text>
          <CategoryPicker value={category} onChange={setCategory} />
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional note"
            multiline
            placeholderTextColor="#94a3b8"
            blurOnSubmit={true}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={styles.photoBtn} onPress={openGallery}>
              <Text style={{ color: "#0f172a", fontWeight: "700" }}>{receiptUri ? "Change photo" : "Choose photo (gallery)"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.photoBtn, { backgroundColor: "#eef2ff" }]} onPress={openCamera}>
              <Text style={{ color: "#0f172a", fontWeight: "700" }}>Use Camera</Text>
            </TouchableOpacity>
          </View>

          {receiptUri ? <Image source={{ uri: receiptUri }} style={{ width: "100%", height: 180, borderRadius: 12, marginTop: 12 }} /> : null}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={{ color: "white", fontWeight: "800" }}>Save Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e9f2ff" },
  heading: { fontSize: 20, fontWeight: "800", marginBottom: 12, color: "#0f172a" },
  card: { backgroundColor: "#ffffff", padding: 12, borderRadius: 14, elevation: 2 },
  label: { fontWeight: "700", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#e6eefb", borderRadius: 8, padding: 10, marginTop: 6 },
  photoBtn: { backgroundColor: "#fff", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e6eefb", alignItems: "center" },
  saveBtn: { marginTop: 14, backgroundColor: "#0f172a", padding: 12, borderRadius: 10, alignItems: "center" },
});
