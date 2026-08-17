import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router } from "expo-router"; 
 
export default function HomeScreen() {

  const { width } = useWindowDimensions();

  const cardWidth = width * 0.72;
  const sideSpace = (width - cardWidth) / 2

  return (
    <View style={objects.container}>
      <Text style={texts.text1}>나의 카드</Text>

      <View style={objects.card_section}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="교통카드 추가"
          onPress={() => router.push("/add-card")}
        >
          <View style={objects.empty_card}>
            <View style={objects.circle}>
              <Text style={texts.plus}>+</Text>
            </View>
            <View style={texts.emptycard_message}>
              <Text>교통카드 추가</Text>
              <Text>눌러서 카드를 등록해 주세요</Text>
            </View>
          </View>
        </Pressable>
      </View>   
    </View>
  );
}

const objects = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: "#ffff",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  card_section: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    marginTop: 100,
    gap: 10
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "rgba(3, 3, 3, 0.4)",
  },
  empty_card: {
    width: 214,
    height: 340,
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(10, 10, 10, 0.45)",
    borderRadius: 16,
    backgroundColor: "rgba(213, 213, 214, 0.5)",
  },
  fix_box: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 25,
    backgroundColor: "#c2c2c2", 
    borderRadius: 30,
    opacity: 0.7
  }

});
const texts = StyleSheet.create({
   text1: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "700",
    textDecorationLine: "underline",
   },
   text2: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.7
   },
   emptycard_message: {
    alignItems: "center",
    alignContent: "center"
   },
   plus: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "300",
    color: "rgba(0, 0, 0, 0.8)",
   }
});

/* (카드 생성 예시)
  <View style={objects.transport_card}>
    <Text style={{color: "white"}}>카드</Text>
  </View>
  <View style={objects.fix_box}>
    <Text style={texts.text2}>수정하기</Text>
  </View>


  transport_card: {
    width: 214,
    height: 340,
    backgroundColor: "green",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 20
  },
*/