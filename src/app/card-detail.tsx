import Ionicons from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCards } from "../context/CardContext";
import { getSubwayLineBadgeText, getSubwayLineColor } from "../utils/subwayLineStyle";
import { useEffect, useState } from "react";
import { getNextSubwaySchedule, getSubwayArrivals } from "../api/subwayApi";
import type { SubwayArrival, SubwaySchedule } from "../api/subwayApi";
import { getSeoulBusArrival, type SeoulBusArrival } from "@/api/seoulBusArrivalApi";
import { canTrainReachDestination } from "../utils/subwayRouteUtils";



export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCards();
  const card = getCardById(id);
  const [arrivalMap, setArrivalMap] = useState<Record<string, SubwayArrival[]>>({});
  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false);
  const [scheduleMap, setScheduleMap] = useState<Record<string, SubwaySchedule | null>>({});
  const [busArrivalMap, setBusArrivalMap] = useState<Record<string, SeoulBusArrival | null>>({});
  const [isLoadingBusArrivals, setIsLoadingBusArrivals] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
    };
  }, []);

  // 지하철
  useEffect(() => {
    if (!card) {
      return;
    }

    let isActive = true;
    const currentCard = card;

    async function loadSubwayArrivals(showLoading: boolean) {
      try {
        if (showLoading && isActive) {
          setIsLoadingArrivals(true);
        }

        const subwaySteps = currentCard.routeSteps.filter(
          (step) => step.type === "subway" && step.stationName
        );

        if (subwaySteps.length === 0) {
          if (isActive) {
            setArrivalMap({});
            setScheduleMap({});
          }

          return;
        }

        const arrivalEntries: Array<readonly [string, SubwayArrival[]]> = [];
        const scheduleEntries: Array<readonly [string, SubwaySchedule | null]> = [];

        await Promise.all(
          subwaySteps.map(async (step) => {
            const arrivals = await getSubwayArrivals(step.stationName!);

            const filteredArrivals = arrivals.filter((arrival) => {
              return (
                arrival.subwayId === step.subwayId &&
                arrival.updnLine === step.subwayDirection &&
                canTrainReachDestination({
                  lineName: step.lineName ?? "",
                  boardingStationName: step.stationName ?? "",
                  destinationStationName: step.destinationStationName ?? "",
                  trainLineName: arrival.trainLineName,
                })
              );
            });

            arrivalEntries.push([step.id, filteredArrivals]);

            if (shouldLoadScheduleFallback(filteredArrivals)) {
              const schedule = await getNextSubwaySchedule(
                step.stationName!,
                step.lineName ?? "",
                step.subwayDirection ?? "",
                step.destinationStationName ?? ""
              );

              scheduleEntries.push([step.id, schedule]);
            } else {
              scheduleEntries.push([step.id, null]);
            }
          })
        );

        if (isActive) {
          setArrivalMap(Object.fromEntries(arrivalEntries));
          setScheduleMap(Object.fromEntries(scheduleEntries));
          setCurrentTime(Date.now());
        }
      } catch (error) {
        console.log("실시간 도착정보 조회 실패:", error);
      } finally {
        if (showLoading && isActive) {
          setIsLoadingArrivals(false);
        }
      }
    }

    loadSubwayArrivals(true);

    const refreshTimer = setInterval(() => {
      loadSubwayArrivals(false);
    }, 30000);

    return () => {
      isActive = false;
      clearInterval(refreshTimer);
    };
  }, [card]);
  //버스
  useEffect(() => {
    if (!card) {
      return;
    }

    let isActive = true;
    const currentCard = card;

    async function loadBusArrivals(showLoading: boolean) {
      try {
        if (showLoading && isActive) {
          setIsLoadingBusArrivals(true);
        }

        const busSteps = currentCard.routeSteps.filter(
          (step) =>
            step.type === "bus" &&
            step.boardingStopId &&
            step.busRouteId &&
            step.boardingStopOrder !== undefined
        );

        if (busSteps.length === 0) {
          if (isActive) {
            setBusArrivalMap({});
          }
          return;
        }

        const entries = await Promise.all(
          busSteps.map(async (step) => {
            const arrival = await getSeoulBusArrival(
              step.boardingStopId!,
              step.busRouteId!,
              step.boardingStopOrder!
            );

            return [step.id, arrival] as const;
          })
        );

        if (isActive) {
          setBusArrivalMap(Object.fromEntries(entries));
          setCurrentTime(Date.now());
        }
      } catch (error) {
        console.log(
          "서울 버스 도착정보 조회 실패:",
          error
        );
      } finally {
        if (showLoading && isActive) {
          setIsLoadingBusArrivals(false);
        }
      }
    }

    loadBusArrivals(true);

    const refreshTimer = setInterval(() => {
      loadBusArrivals(false);
    }, 30000);

    return () => {
      isActive = false;
      clearInterval(refreshTimer);
    };
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

        <View style={[
          objects.cardHero,
          { backgroundColor: card.color }
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
                <View
                  style={[
                    objects.routeStepBadge,
                    step.type === 'subway' && {
                      backgroundColor: getSubwayLineColor(step.lineName),
                    },
                  ]}
                >
                  <Text
                    style={[
                      texts.routeStepBadgeText,
                      step.type === "bus" &&
                      texts.busRouteStepBadgeText,
                    ]}
                  >
                    {step.type === 'subway'
                      ? getSubwayLineBadgeText(step.lineName)
                      : step.type === "bus"
                        ? step.busNumber ?? step.name
                        : index + 1}
                  </Text>
                </View>

                <View style={objects.routeStepContent}>
                  <View style={objects.routeHeaderRow}>
                    <View>
                      <Text style={texts.routeStepLabel}>승차</Text>
                      <Text style={texts.routeStepName}>
                        {step.type === "bus"
                          ? step.boardingStopName ?? step.busStopName ?? "승차 정류장"
                          : step.stationName
                            ? `${step.stationName}역`
                            : step.name}
                      </Text>
                    </View>

                    {step.type === "subway" ? (
                      <View style={objects.transportTypePill}>
                        <Ionicons name="train-outline" size={16} color="#2563EB" />
                        <Text style={texts.transportTypeText}>{step.lineName}</Text>
                      </View>
                    ) : step.type === "bus" ? (
                      <View style={objects.transportTypePill}>
                        <Ionicons name="bus-outline" size={16} color="#2563EB" />
                        <Text style={texts.transportTypeText}>
                          {step.busNumber ?? "버스"}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={objects.routeLineArea}>
                    <View style={objects.routeVerticalLine} />

                    <View style={objects.routeMiddleContent}>
                      <Text style={texts.routeStepDetail}>{step.detail}</Text>

                      {step.type === "subway" ? (
                        <View style={objects.arrivalBox}>
                          <Text style={texts.arrivalLabel}>
                            {isLoadingArrivals
                              ? "실시간 도착정보 불러오는 중..."
                              : "실시간 도착정보"}
                          </Text>

                          {arrivalMap[step.id]?.length > 0 ? (
                            arrivalMap[step.id].slice(0, 2).map((arrival, index) => (
                              <Text
                                key={`${arrival.trainLineName}-${index}`}
                                style={texts.arrivalText}
                              >
                                {formatArrivalTime(arrival, currentTime)} · {arrival.trainLineName}
                              </Text>
                            ))
                          ) : !isLoadingArrivals ? (
                            <Text style={texts.arrivalEmptyText}>
                              현재 도착정보가 없습니다.
                            </Text>
                          ) : null}

                          {!isLoadingArrivals && scheduleMap[step.id] ? (
                            <Text style={texts.scheduleText}>
                              다음 예정 출발 {scheduleMap[step.id]?.label}
                            </Text>
                          ) : null}
                        </View>
                      ) : step.type === "bus" ? (
                        <View style={objects.arrivalBox}>
                          <Text style={texts.arrivalLabel}>
                            {isLoadingBusArrivals
                              ? "실시간 도착정보 불러오는 중..."
                              : "실시간 도착정보"}
                          </Text>

                          {busArrivalMap[step.id] ? (
                            <>
                              <Text selectable style={texts.arrivalText}>
                                첫 번째 버스 ·{" "}
                                <Text style={texts.arrivalText}>
                                  {formatBusArrivalDisplay(
                                    busArrivalMap[step.id]!,
                                    "first",
                                    currentTime
                                  )}
                                </Text>
                              </Text>

                              <Text selectable style={texts.arrivalText}>
                                두 번째 버스 ·{" "}
                                <Text style={texts.arrivalText}>
                                  {formatBusArrivalDisplay(
                                    busArrivalMap[step.id]!,
                                    "second",
                                    currentTime
                                  )}
                                </Text>
                              </Text>
                            </>
                          ) : !isLoadingBusArrivals ? (
                            <Text style={texts.arrivalEmptyText}>
                              현재 버스 도착정보가 없습니다.
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {(step.type === "subway" && step.destinationStationName) ||
                    (step.type === "bus" && step.alightingStopName) ? (
                    <View style={objects.destinationRow}>
                      <View style={objects.destinationDot} />

                      <View>
                        <Text style={texts.routeStepLabel}>하차</Text>
                        <Text style={texts.destinationText}>
                          {step.type === "subway"
                            ? `${step.destinationStationName}역`
                            : step.alightingStopName}
                        </Text>
                      </View>
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
  routeHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  transportTypePill: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  routeLineArea: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  routeVerticalLine: {
    width: 3,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginLeft: 19,
  },

  routeMiddleContent: {
    flex: 1,
    gap: 8,
  },

  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  destinationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#2563EB",
    marginLeft: 13,
  }
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
    color: "#cf1313",
    fontSize: 12,
    fontWeight: "800",
    fontVariant: ["tabular-nums"]
  },
  arrivalEmptyText: {
    color: "#cf1313",
    fontSize: 12,
    fontWeight: "600",
  },
  scheduleText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "800",
  },
  busRouteStepBadgeText: {
    fontSize: 13,
    lineHeight: 12,
    letterSpacing: -0.5
  },
  routeStepLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "800",
  },

  transportTypeText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "900",
  },

  destinationText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  }
});
function formatArrivalTime(arrival: SubwayArrival, currentTime: number) {
  if (arrival.remainingSeconds > 0) {
    const elapsedSeconds = Math.max(
      0,
      Math.floor((currentTime - arrival.fetchedAt) / 1000)
    );

    const remainingSeconds = Math.max(
      0,
      arrival.remainingSeconds - elapsedSeconds
    );

    if (remainingSeconds === 0) {
      return "곧 도착";
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return minutes > 0
      ? `${minutes}분 ${seconds}초 후`
      : `${seconds}초 후`;
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

function shouldLoadScheduleFallback(arrivals: SubwayArrival[]) {
  if (arrivals.length === 0) {
    return true;
  }

  const hasUsefulRealtimeInfo = arrivals.some((arrival) => {
    return (
      arrival.remainingSeconds > 0 ||
      arrival.arrivalMessage.includes("전역") ||
      arrival.arrivalMessage.includes("진입")
    );
  });

  return !hasUsefulRealtimeInfo;
}
function formatBusArrivalDisplay(
  arrival: SeoulBusArrival,
  order: "first" | "second",
  currentTime: number
) {
  const initialSeconds =
    order === "first"
      ? arrival.firstArrivalSeconds
      : arrival.secondArrivalSeconds;

  const originalMessage =
    order === "first"
      ? arrival.firstMessage
      : arrival.secondMessage;

  const stopInfo =
    originalMessage.match(/\[(.*?)\]/)?.[1] ?? "";

  let timeText: string;

  if (initialSeconds > 0) {
    const elapsedSeconds = Math.max(
      0,
      Math.floor((currentTime - arrival.fetchedAt) / 1000)
    );

    const remainingSeconds = Math.max(
      0,
      initialSeconds - elapsedSeconds
    );

    if (remainingSeconds === 0) {
      timeText = "곧 도착";
    } else {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      timeText =
        minutes > 0
          ? `${minutes}분 ${seconds}초 후`
          : `${seconds}초 후`;
    }
  } else {
    timeText =
      originalMessage.replace(/\[.*?\]/, "").trim() ||
      "도착정보 없음";
  }

  return stopInfo
    ? `${timeText} · ${stopInfo}`
    : timeText;
}
