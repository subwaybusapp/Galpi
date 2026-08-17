import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#ffff"}}
        edges={["top", "left", "right"]}
      >
        <StatusBar barStyle="dark-content" />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen 
            name="add-card"
            options={{
              animation: "fade_from_bottom",
              animationDuration: 500
            }}
          />
          <Stack.Screen name="(tab)" />
        </Stack>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
