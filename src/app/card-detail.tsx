import Ionicons from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCards } from "../context/CardContext";
import { getSubwayLineBadgeText, getSubwayLineColor } from "../utils/subwayLineStyle";
import { useEffect, useState } from "react";
import { getNextSubwaySchedule, getSubwayArrivals } from "../api/subwayApi";
import type { SubwayArrival, SubwaySchedule } from "../api/subwayApi";



export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCards();
  const card = getCardById(id);
  const [arrivalMap, setArrivalMap] = useState<Record<string, SubwayArrival[]>>({});
  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false);
  const [scheduleMap, setScheduleMap] = useState<Record<string, SubwaySchedule | null>>({});

  useEffect(() => {
    if (!card) {
      return;
    }

    const currentCard = card;

    async function loadSubwayArrivals() {
      try {
        setIsLoadingArrivals(true);

        const subwaySteps = currentCard.routeSteps.filter(
          (step) => step.type === "subway" && step.stationName
        );

        const arrivalEntries: Array<readonly [string, SubwayArrival[]]> = [];
        const scheduleEntries: Array<readonly [string, SubwaySchedule | null]> = [];

        await Promise.all(
          subwaySteps.map(async (step) => {
            const arrivals = await getSubwayArrivals(step.stationName!);

            const filteredArrivals = arrivals.filter((arrival) => {
              return (
                arrival.subwayId === step.subwayId &&
                arrival.updnLine === step.subwayDirection
              );
            });

            arrivalEntries.push([step.id, filteredArrivals]);

            if (shouldLoadScheduleFallback(filteredArrivals)) {
              const schedule = await getNextSubwaySchedule(
                step.stationName!,
                step.lineName ?? "",
                step.subwayDirection ?? "",
                extractDestinationFromDetail(step.detail)
              );

              scheduleEntries.push([step.id, schedule]);
            } else {
              scheduleEntries.push([step.id, null]);
            }
          })
        );

        setArrivalMap(Object.fromEntries(arrivalEntries));
        setScheduleMap(Object.fromEntries(scheduleEntries));

      } catch (error) {
        console.log("실시간 도착정보 조회 실패:", error);
      } finally {
        setIsLoadingArrivals(false);
      }
    }

    loadSubwayArrivals();
  }, [card]);


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

        <View style={[objects.cardHero, { backgroundColor: card.color }]}>
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
                <View
                  style={[
                    objects.routeStepBadge,
                    step.type === 'subway' && {
                      backgroundColor: getSubwayLineColor(step.lineName),
                    },
                  ]}
                >
                  <Text style={texts.routeStepBadgeText}>
                    {step.type === 'subway'
                      ? getSubwayLineBadgeText(step.lineName)
                      : index + 1}
                  </Text>
                </View>

                <View style={objects.routeStepContent}>
                  <View style={objects.routeStepTitleRow}>
                    <Text style={texts.routeStepName}>{step.name}</Text>

                    {step.type === "subway" ? (
                      <Ionicons name="train-outline" size={30} color="#6B7280" />
                    ) : null}
                  </View>

                  <Text style={texts.routeStepDetail}>{step.detail}</Text>
                  {step.type === "subway" ? (
                    <View style={objects.arrivalBox}>
                      <Text style={texts.arrivalLabel}>
                        {isLoadingArrivals ? "실시간 도착정보 불러오는 중..." : "실시간 도착정보"}
                      </Text>

                      {arrivalMap[step.id]?.length > 0 ? (
                        arrivalMap[step.id].slice(0, 2).map((arrival, index) => (
                          <Text key={`${arrival.trainLineName}-${index}`} style={texts.arrivalText}>
                            {formatArrivalTime(arrival)} · {arrival.trainLineName}
                          </Text>
                        ))
                      ) : !isLoadingArrivals ? (
                        <Text style={texts.arrivalEmptyText}>현재 도착정보가 없습니다.</Text>
                      ) : null}

                      {!isLoadingArrivals && scheduleMap[step.id] ? (
                        <Text style={texts.scheduleText}>
                          다음 예정 출발 {scheduleMap[step.id]?.label}
                        </Text>
                      ) : null}

                    </View>
                  ) : null}
                </View>


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
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  routeStepBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "transparent",
    marginTop: 2,
  },
  routeStepContent: {
    flex: 1,
    gap: 2,
  },
  routeStepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  arrivalBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F3F6FA",
    gap: 4,
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
    fontSize: 18,
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
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  backHomeButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  arrivalLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "800",
  },

  arrivalText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
  },

  arrivalEmptyText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
  scheduleText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "800",
  }
});
function formatArrivalTime(arrival: SubwayArrival) {
  if (arrival.remainingSeconds > 0) {
    const minutes = Math.floor(arrival.remainingSeconds / 60);
    const seconds = arrival.remainingSeconds % 60;

    if (minutes > 0) {
      return `${minutes}분 ${seconds}초 후`;
    }

    return `${seconds}초 후`;
  }

  return formatArrivalMessage(arrival.arrivalMessage);
}
function formatArrivalMessage(message: string) {
  const previousStationMatch = message.match(/\[(\d+)\]번째 전역 \((.+)\)/);

  if (previousStationMatch) {
    const stationCount = previousStationMatch[1];
    const stationName = previousStationMatch[2];

    return `${stationCount}정거장 전 · ${stationName} 부근`;
  }

  return message;
}
function extractDestinationFromDetail(detail: string) {
  const parts = detail.split("·");
  const destinationPart = parts[1]?.trim() ?? "";

  return destinationPart.replace(/행$/, "");
}
function shouldLoadScheduleFallback(arrivals: SubwayArrival[]) {
  if (arrivals.length === 0) {
    return true;
  }

  return arrivals.some((arrival) => {
    return (
      arrival.remainingSeconds === 0 &&
      (arrival.arrivalMessage.includes("도착") ||
        arrival.arrivalMessage.includes("출발"))
    );
  });
}
