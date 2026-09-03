import { auth } from "@/lib/firebase";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const atPosition = email.indexOf("@");
  const nicknamePreview =
    atPosition > 0 ? email.slice(0, atPosition).trim() : "";

  async function handleSignUp() {
    if (isSubmitting) {
      return;
    }

    const cleanEmail = email.trim();
    const cleanAtPosition = cleanEmail.indexOf("@");

    if (cleanAtPosition <= 0) {
      Alert.alert("입력 오류", "올바른 이메일 주소를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("입력 오류", "비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordCheck) {
      Alert.alert("입력 오류", "비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    const nickname = cleanEmail.slice(0, cleanAtPosition);

    try {
      setIsSubmitting(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: nickname,
      });

      Alert.alert(
        "회원가입 성공",
        `${nickname}님, 환영합니다!`,
        [
          {
            text: "확인",
            onPress: () => router.replace("/(tab)"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "회원가입 실패",
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>회원가입</Text>

          <Text style={styles.description}>
            이메일과 비밀번호로 계정을 만들어주세요.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="이메일 주소"
            placeholderTextColor="#9B8BA9"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
          />

          {nicknamePreview.length > 0 && (
            <Text style={styles.nicknamePreview}>
              사용할 닉네임: {nicknamePreview}
            </Text>
          )}

          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="비밀번호 (6자 이상)"
            placeholderTextColor="#9B8BA9"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            secureTextEntry
            returnKeyType="next"
          />

          <TextInput
            value={passwordCheck}
            onChangeText={setPasswordCheck}
            style={styles.input}
            placeholder="비밀번호 확인"
            placeholderTextColor="#9B8BA9"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
          />

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleSignUp}
            style={({ pressed }) => [
              styles.signUpButton,
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signUpButtonText}>회원가입</Text>
            )}
          </Pressable>

          <Link href="/" style={styles.backLink}>
            이미 계정이 있나요? 로그인하기
          </Link>
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    color: "#49336F",
    fontSize: 34,
    fontWeight: "900",
  },
  description: {
    marginTop: 8,
    color: "#74667D",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 12,
  },
  input: {
    width: "100%",
    minHeight: 54,
    paddingHorizontal: 17,
    color: "#261B31",
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9DFF0",
    borderRadius: 17,
  },
  nicknamePreview: {
    marginTop: -3,
    paddingHorizontal: 8,
    color: "#6242C7",
    fontSize: 14,
    fontWeight: "700",
  },
  signUpButton: {
    minHeight: 54,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7653E8",
    borderRadius: 17,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  backLink: {
    marginTop: 8,
    paddingVertical: 10,
    color: "#6242C7",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});