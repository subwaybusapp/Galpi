import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View, ViewToken, Image } from "react-native";
import { router } from "expo-router";
import { useCards } from "../../context/CardContext";
import { FlatList } from "react-native-gesture-handler";
import { MoveCard } from "@/types/card";
import { useEffect, useRef, useState } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth"

const ORIGINAL_CARD_WIDTH = 214;
const ORIGINAL_CARD_HEIGHT = 340;
const CARD_ASPECT_RATIO = ORIGINAL_CARD_WIDTH / ORIGINAL_CARD_HEIGHT;
const CARD_GAP = 20;
const CARD_HORIZONTAL_INSET = 24;
const CARD_MAX_WIDTH = 300;

export default function HomeScreen() {

  const { width } = useWindowDimensions();

  const { cards, toggleBookmark, deleteCard } = useCards();
  const [ views, setViews ] = useState(true); // false가 scroll View / ture가 page View

  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const favoriteCards = cards.filter(
    (card) => card.isBookmarked
  );

  const displayedCards = showFavoritesOnly
    ? favoriteCards
    : cards;

	async function handleLogout() {
		try {
			await signOut(auth);
			router.replace("/login");
		} catch {
			Alert.alert("로그아웃 실패", "다시 시도해 주세요.");
		}
	}

  function toggleFavoriteFilter() {
    if (!showFavoritesOnly && favoriteCards.length === 0) {
      Alert.alert("즐겨찾기 된 카드가 없습니다!");
      return;
    }

    setShowFavoritesOnly((previousValue) => !previousValue);
  }

  async function handleToggleBookmark(id: string) {
    try {
      await toggleBookmark(id);
    } catch (error) {
      console.error("즐겨찾기를 변경하지 못했습니다.", error);
      Alert.alert("변경 실패", "즐겨찾기를 변경하지 못했습니다.");
    }
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
          onPress: async () => {
            try {
              await deleteCard(card.id);
              setDeleteTargetId(null);
            } catch (error) {
              console.error("카드를 삭제하지 못했습니다.", error);
              Alert.alert("삭제 실패", "카드를 삭제하지 못했습니다.");
            }
          },
        },
      ]
    );
  }

  function changeView() {
    setViews((previousValue) => !previousValue);
  }

  const cardWidth = Math.min(
    width - CARD_HORIZONTAL_INSET * 2,
    CARD_MAX_WIDTH
  );
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const itemSize = cardWidth + CARD_GAP;

  const listRef = useRef<FlatList<MoveCard>>(null);
  const middleIndex = displayedCards.length > 0
    ? Math.floor((displayedCards.length - 1) / 2)
    : 0;
  const [currentIndex, setCurrentIndex] = useState(middleIndex);
  const sideSpace = (width - cardWidth) / 2;

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
    if(displayedCards.length === 0) return;
    
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: true
    })
  }
  const moveToLast = () => {
    if (displayedCards.length === 0) return;

    listRef.current?.scrollToOffset({
      offset: (displayedCards.length - 1) * itemSize,
      animated: true,
    });
  }

  useEffect(() => {
    if (!views || displayedCards.length === 0) return;

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: middleIndex * itemSize,
        animated: false
      });
      setCurrentIndex(middleIndex);
    })
    return () => cancelAnimationFrame(frame)
  }, [displayedCards.length, itemSize, middleIndex, views])

  return (
      <View style={objects.container}>
			<View style={objects.header}>
				<Text style={texts.text1}>나의 카드</Text>

				<Pressable
					accessibilityRole="button"
					accessibilityLabel="로그아웃"
					hitSlop={8}
					onPress={handleLogout}
					style={({ pressed }) => [
						objects.logoutButton,
						pressed && objects.logoutButtonPressed,
					]}
				>
					<Ionicons
						name="log-out-outline"
						size={18}
						color="#6242C7"
					/>

					<Text style={texts.logoutButtonText}>
						로그아웃
					</Text>
				</Pressable>
			</View>
        <View style={objects.card_section}>

					<FlatList
						key={views ? "horizontal" : "vertical"}
						horizontal={views}
						showsHorizontalScrollIndicator={false}
						snapToAlignment={views ? "start" : undefined}
						decelerationRate={views ? "fast" : "normal"}
						disableIntervalMomentum={views}
						viewabilityConfig={viewabliltyConfig}
						onViewableItemsChanged={onViewableItemsChanged}
						snapToInterval={views ? itemSize : undefined}
						ref={listRef}
						style={[
							{ width: "100%" },
							views
								? { height: cardHeight, flexGrow: 0 }
								: { flex: 1 },
						]}
						contentContainerStyle={{
							paddingHorizontal: sideSpace,
							paddingBottom: views ? 0 : 24,
							gap: CARD_GAP
						}}
						onMomentumScrollEnd={(event) => {
							if (!views) return;

							const offsetX = event.nativeEvent.contentOffset.x;
							const calculatedIndex = Math.round(offsetX / itemSize);

							const safeIndex = Math.max(
								0,
								Math.min(calculatedIndex, displayedCards.length)
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
									views
										? { width: cardWidth, height: cardHeight }
										: objects.verticalCard,
									{
										backgroundColor: item.color,
										borderStyle: "solid",
									},
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
										void handleToggleBookmark(item.id);
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
							style={!views ? objects.verticalCardWrapper : undefined}
							accessibilityRole="button"
							accessibilityLabel="교통카드 추가"
							onPress={() => router.push("/add-card")}
						>
							<View
								style={[
									objects.empty_card,
									views
										? { width: cardWidth, height: cardHeight }
										: objects.verticalEmptyCard,
								]}
							>
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
						<Pressable onPress={moveTofirst} disabled={displayedCards.length === 0}>
							<Ionicons name={displayedCards.length <= 1 ? "play-skip-back-outline" : "play-skip-back"}
								size={25}
							/>
						</Pressable>
						{views && (
							<View>
								<Text style={texts.text3}>
									{displayedCards.length === 0
										? "0 / 0" : currentIndex >= displayedCards.length
											? "추가" : `${currentIndex + 1} / ${displayedCards.length}`}
								</Text>
							</View>
						)}
						<Pressable onPress={moveToLast} disabled={displayedCards.length === 0}>
							<Ionicons name={displayedCards.length <= 1 ? "play-skip-forward-outline" : "play-skip-forward"}
								size={25}
							/>
						</Pressable>
					</View>

					<View style={objects.favoriteContainer}>
						<Pressable
							onPress={toggleFavoriteFilter}
							style={({ pressed }) => [
								objects.selectViewtoggle,
								showFavoritesOnly && objects.favoriteToggleActive,
								pressed && objects.togglePressed,
							]}
						>
							{showFavoritesOnly ?
								<Ionicons
									name={"bookmark"}
									size={33}
									color={"#FFD43B"}
								/> :
								<Ionicons
									name={"bookmark-outline"}
									size={33}
								/>
							}
						</Pressable>
						<Pressable
							onPress={changeView}
							style={({ pressed }) => [
								objects.selectViewtoggle,
								pressed && objects.togglePressed,
							]}
						>
							<Image
								source={ views ? require('@/assets/ViewType_1.png') : require('@/assets/ViewType_2.png')}
								style={objects.selectViewImage}
								resizeMode="contain"
							/>
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
		marginTop: "auto",
		marginBottom: 50,
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    borderRadius: 28,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
  },
  deleteButton: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#D92D20",
    borderRadius: 10,
  },
	header: {
		width: "100%",
		paddingHorizontal: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
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
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(10, 10, 10, 0.45)",
    borderRadius: 16,
    backgroundColor: "rgba(213, 213, 214, 0.5)",
  },
  verticalCardWrapper: {
    width: "100%",
  },
  verticalEmptyCard: {
    width: "100%",
    minHeight: 150,
    paddingVertical: 20,
    gap: 16,
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
  verticalCard: {
    width: "100%",
    minHeight: 150,
  },
  selectViewtoggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    overflow: 'hidden',
  },
  favoriteToggleActive: {
    backgroundColor: "rgba(255, 212, 59, 0.24)",
  },
  togglePressed: {
    opacity: 0.62,
    transform: [{ scale: 0.96 }],
  },
  selectViewImage: {
    width: 47,
    height: 47,
  },
	logoutButton: {
		minHeight: 30,
		marginTop: 20,
		paddingHorizontal: 13,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		backgroundColor: "#EEE8FF",
		borderWidth: 1,
		borderColor: "#D9CDFF",
		borderRadius: 12,
	},
	logoutButtonPressed: {
		opacity: 0.65,
		transform: [{ scale: 0.97 }],
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
	logoutButtonText: {
		color: "#6242C7",
		fontSize: 14,
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
