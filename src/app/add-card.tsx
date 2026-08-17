import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddCardScreen() {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("이름");

  const trimmedName = name.trim();
  const previewName = trimmedName || savedName;

  function handleSave() {
    if (!trimmedName) {
      return;
    }

    setSavedName(trimmedName);
    setName("");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={objects.scrollContent}
    >
      <View style={objects.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 화면으로 이동"
          onPress={() => router.back()}
          style={objects.backButton}
        >
          <Ionicons name="chevron-back-sharp" size={30} />
        </Pressable>

        <Text style={texts.title}>카드 생성</Text>

        <View style={objects.previewSection}>
          <View style={objects.emptyCard}>
            <Text selectable style={texts.cardName}>
              {previewName}
            </Text>
          </View>
        </View>

        <View style={objects.formSection}>
          <Text style={texts.label}>카드 이름</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleSave}
            placeholder="카드 이름을 입력하세요"
            maxLength={20}
            returnKeyType="done"
            style={objects.nameInput}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="카드 이름 저장"
            accessibilityState={{ disabled: !trimmedName }}
            disabled={!trimmedName}
            onPress={handleSave}
            style={({ pressed }) => [
              objects.saveButton,
              !trimmedName && objects.saveButtonDisabled,
              pressed && trimmedName && objects.saveButtonPressed,
            ]}
          >
            <Text style={texts.saveButtonLabel}>저장</Text>
          </Pressable>

          <Text selectable style={texts.helperText}>
            저장된 이름: {savedName}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const objects = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    gap: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
  },
  previewSection: {
    width: "100%",
    alignItems: "center",
  },
  emptyCard: {
    width: 214,
    height: 340,
    padding: 15,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(10, 10, 10, 0.45)",
    borderRadius: 16,
    backgroundColor: "rgba(213, 213, 214, 0.5)",
  },
  formSection: {
    width: "100%",
    gap: 10,
    paddingTop: 4,
  },
  nameInput: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  saveButtonDisabled: {
    opacity: 0.35,
  },
  saveButtonPressed: {
    opacity: 0.75,
  },
});

const texts = StyleSheet.create({
  title: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  saveButtonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  helperText: {
    color: "#6B7280",
    fontSize: 13,
  },
});
