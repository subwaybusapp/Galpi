import Ionicons from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCards } from "../context/CardContext";

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCards();

  const card = getCardById(id);

  if (!card) {
    return (
      <View style={objects.centerContainer}>
        <Text style={texts.title}>카드를 찾을 수 없어요</Text>

        <Pressable style={objects.backHomeButton} onPress={() => router.back()}>
          <Text style={texts.backHomeButtonLabel}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
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

        <View style={objects.header}>
          <Text style={texts.kicker}>MY MOVE CARD</Text>
          <Text style={texts.title}>{card.name}</Text>
          <Text style={texts.subtitle}>
            저장한 경로를 한눈에 확인할 수 있어요.
          </Text>
        </View>

        <View style={[
          objects.cardHero,
          {backgroundColor: card.color}
          ]}>
          <Text style={texts.cardHeroTitle}>{card.name}</Text>

          <Text style={texts.cardHeroRoute} numberOfLines={3}>
            {card.routeSteps.length > 0
              ? card.routeSteps.map((step) => step.name).join(" → ")
              : "경로 정보 없음"}
          </Text>
        </View>

        <View style={objects.section}>
          <Text style={texts.sectionTitle}>전체 경로</Text>

          {card.routeSteps.length > 0 ? (
            card.routeSteps.map((step, index) => (
              <View key={step.id} style={objects.routeStepItem}>
                <View style={objects.routeStepBadge}>
                  <Text style={texts.routeStepBadgeText}>{index + 1}</Text>
                </View>

                <View style={objects.routeStepContent}>
                  <Text style={texts.routeStepName}>{step.name}</Text>
                  <Text style={texts.routeStepDetail}>{step.detail}</Text>
                </View>

                {step.minutes ? (
                  <Text style={texts.routeStepMinutes}>{step.minutes}분</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={texts.emptyText}>등록된 경로가 없어요.</Text>
          )}
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
  centerContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    gap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
  },
  backHomeButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  header: {
    gap: 6,
  },
  cardHero: {
    minHeight: 180,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#111827",
    justifyContent: "space-between",
  },
  section: {
    gap: 10,
  },
  routeStepItem: {
    minHeight: 64,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeStepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  routeStepContent: {
    flex: 1,
    gap: 2,
  },
});

const texts = StyleSheet.create({
  kicker: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
  },
  cardHeroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  cardHeroRoute: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  routeStepBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  routeStepName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
  routeStepDetail: {
    color: "#6B7280",
    fontSize: 12,
  },
  routeStepMinutes: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  backHomeButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});