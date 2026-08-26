import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View, ViewToken } from "react-native";
import { router } from "expo-router";
import { useCards } from "../../context/CardContext";
import { FlatList } from "react-native-gesture-handler";
import { MoveCard } from "@/types/card";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";

export default function HomeScreen() {

  const { width } = useWindowDimensions();

  const { cards, toggleBookmark, deleteCard } = useCards();

  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const favoriteCards = cards.filter(
    (card) => card.isBookmarked
  );

  const displayedCards = showFavoritesOnly
    ? favoriteCards
    : cards;

  function toggleFavoriteFilter() {
    if (!showFavoritesOnly && favoriteCards.length === 0) {
      Alert.alert("즐겨찾기 된 카드가 없습니다!");
      return;
    }

    setShowFavoritesOnly((previousValue) => !previousValue);
  }

  function confirmDeleteCard(card: MoveCard) {
    Alert.alert(
      "카드 삭제",
      `"${card.name}" 카드를 삭제할까요?`,
      [
        {
          text: "취소",
          style: "cancel",
          onPress: () => setDeleteTargetId(null),
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            deleteCard(card.id);
            setDeleteTargetId(null);
          },
        },
      ]
    );
  }

  const cardWidth = 214;
  const cardGap = 20;
  const Item_Size = cardWidth + cardGap;

  const listRef = useRef<FlatList<MoveCard>>(null);
  const middleIndex = cards.length > 0 ? Math.floor((cards.length - 1) / 2) : 0;
  const [currentIndex, setCurrentIndex] = useState(middleIndex);
  const sideSpace = (width - cardWidth) / 2

  const viewabliltyConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const visibleIndex = viewableItems[0]?.index;

      if (visibleIndex != null) {
        setCurrentIndex(visibleIndex);
      }
    }
  ).current;

  function moveTofirst() {
    if(cards.length === 0) return;
    
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: true
    })
  }
  const moveToLast = () => {
    if (cards.length === 0) return;

    listRef.current?.scrollToOffset({
      offset: (cards.length - 1) * Item_Size,
      animated: true,
    });
  }

  useEffect(() => {
    if(cards.length === 0) return;

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: middleIndex * Item_Size,
        animated: false
      })
    })
    return () => cancelAnimationFrame(frame)
  },[cards.length, middleIndex])

  return (
      <View style={objects.container}>
        <View style={objects.header}>
          <Text style={texts.text1}>나의 카드</Text>
        </View>
        
        <View style={objects.card_section}>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            viewabilityConfig={viewabliltyConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            snapToInterval={Item_Size}
            ref={listRef}
            style={{ width: "100%", height: 340, flexGrow: 0}}
            contentContainerStyle={{
              paddingHorizontal: sideSpace,
              gap: 20
            }}
            
            onMomentumScrollEnd={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const calculatedIndex = Math.round(offsetX / Item_Size);

              const safeIndex = Math.max(
                0,
                Math.min(calculatedIndex, cards.length)
              );

              setCurrentIndex(safeIndex);
            }}

            data={displayedCards}
            keyExtractor={(card) => card.id}
            renderItem={({ item }) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} 카드 상세 보기`}
                style={[
                  objects.transport_card,
                  {
                    backgroundColor: item.color, borderStyle: "solid"}
                ]}
                onPress={() => router.push(`/card-detail?id=${item.id}`)}
                onLongPress={() => {
                  setDeleteTargetId((currentId) =>
                    currentId === item.id ? null : item.id
                  );
                }}
                delayLongPress={600}
              >
                <View style={texts.cardTitle_header}>
                  <Text style={texts.cardTitle}>{item.name}</Text>
                  <Pressable
                  hitSlop={10}
                    accessibilityRole="button"
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleBookmark(item.id);
                    }}
                  >
                    <Ionicons 
                      name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                      size={27}
                      color={item.isBookmarked ? "#FFD43B" : "#000000"}
                    />
                  </Pressable>
                </View>

                <Text style={texts.cardSubtitle} numberOfLines={3}>
                  {item.routeSteps.length > 0
                    ? item.routeSteps.map((step) => step.name).join(" → ")
                    : "경로 정보 없음"}
                </Text>

                {deleteTargetId === item.id && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name} 카드 삭제`}
                    style={objects.deleteButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      confirmDeleteCard(item);
                    }}
                  >
                    <Text style={texts.deleteButtonText}>삭제</Text>
                  </Pressable>
                )}
              </Pressable>
            )}
            ListFooterComponent={
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
            }
          />
          <View style={objects.buttonContainer}>
            <Pressable onPress={moveTofirst} disabled={cards.length === 0}>
              <Ionicons name={cards.length <= 1 ? "play-skip-back-outline" : "play-skip-back"} 
                size={25} 
              /> 
            </Pressable>
            <View>
              <Text style={texts.text3}>
                {cards.length === 0 
                  ? "0 / 0" : currentIndex >= cards.length 
                    ? "추가" : `${currentIndex + 1} / ${cards.length}`}
              </Text>
            </View>
            <Pressable onPress={moveToLast} disabled={cards.length === 0}>
              <Ionicons name={cards.length <= 1 ? "play-skip-forward-outline" : "play-skip-forward"}  
                size={25} 
              />
            </Pressable>
          </View>
          <View style={objects.favoriteContainer}>
            <Pressable
              onPress={toggleFavoriteFilter}
            >
              <Text>{showFavoritesOnly ? "전체 카드 보기" : "즐겨찾기"}</Text>
            </Pressable>
          </View>
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
    paddingBottom: 15,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  favoriteContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  deleteButton: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#D92D20",
    borderRadius: 10,
  },
  header: {
    paddingHorizontal: 15,
  },
  card_section: {
    flex: 1,
    width: "100%",
    alignItems: "stretch",
    marginTop: 100,
    gap: 15
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
  },
  transport_card: {
    width: 214,
    height: 340,
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 40,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(10, 10, 10, 0.45)",
    borderRadius: 16,
    backgroundColor: "rgba(213, 213, 214, 0.5)",
  },
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
  text3: {
    fontSize: 20,
    fontWeight: "700",
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
  },
  cardTitle_header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  cardSubtitle: {
    color: "#000000",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "300",
    textDecorationLine: "underline",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
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
