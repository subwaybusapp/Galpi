import { auth } from "@/lib/firebase";
import { router } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");

  async function handleLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        id.trim(),
        pwd
      )
      router.replace("/(tab)/(home)")
    } catch (error) {
      Alert.alert("로그인 실패", error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    }
  }
  async function handleGuest() {
    try {
      Alert.alert("게스트 로그인은 앱 종료 시 데이터가 저장되지 않을 수 있습니다.")
      await signOut(auth)
      router.replace("/(tab)")
    } catch (error) {
      Alert.alert("게스트 모드를 실행하지 못했습니다.")
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <TextInput
            value={id}
            onChangeText={setId}
            style={styles.inputBox}
            placeholder="아이디를 입력하세요."
            placeholderTextColor="#9B8BA9"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
          />
          <TextInput
            value={pwd}
            onChangeText={setPwd}
            style={styles.inputBox}
            placeholder="비밀번호를 입력하세요."
            placeholderTextColor="#9B8BA9"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            secureTextEntry
            returnKeyType="done"
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.button,
              styles.loginButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </Pressable>
          
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/sign_up")}
            style={({ pressed }) => [
              styles.button,
              styles.signUpButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.signUpButtonText}>회원가입</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleGuest}
            style={({ pressed }) => [
              styles.previewButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.previewButtonText}>로그인 없이 둘러보기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1ececb9",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 18,
  },
  hero: {
    width: "100%",
    maxWidth: 420,
    height: 320,
    position: "relative",
  },
  appLogo: {
    position: "absolute",
    left: -40,
    top: 22,
    zIndex: 1,
    width: "78%",
    height: "88%",
  },
  titleBox: {
    position: "absolute",
    right: 15,
    top: 42,
    zIndex: 2,
    alignItems: "flex-end",
    transform: [{ rotate: "7deg" }],
  },
  tagline: {
    color: "#49336F",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  title: {
    fontSize: 58,
    lineHeight: 66,
    fontWeight: "900",
    textShadowColor: "rgba(71, 40, 120, 0.24)",
    textShadowOffset: { width: 3, height: 5 },
    textShadowRadius: 2,
  },
  titlePurple: {
    color: "#8B5CF6",
  },
  titleRed: {
    color: "#FF5A5F",
  },
  titleGreen: {
    color: "#22C55E",
  },
  form: {
    width: "100%",
    maxWidth: 420,
    gap: 12,
  },
  inputBox: {
    width: "100%",
    minHeight: 54,
    paddingHorizontal: 17,
    color: "#261B31",
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9DFF0",
    borderRadius: 17,
    borderCurve: "continuous",
    boxShadow: "0 4px 14px rgba(73, 51, 111, 0.08)",
  },
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderCurve: "continuous",
  },
  loginButton: {
    marginTop: 4,
    backgroundColor: "#7653E8",
    boxShadow: "0 7px 16px rgba(118, 83, 232, 0.28)",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  signUpButton: {
    backgroundColor: "#EEE8FF",
    borderWidth: 1,
    borderColor: "#D9CDFF",
  },
  signUpButtonText: {
    color: "#6242C7",
    fontSize: 16,
    fontWeight: "800",
  },
  previewButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  previewButtonText: {
    color: "#74667D",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});
