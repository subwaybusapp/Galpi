import { StyleSheet, Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text>검색 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});