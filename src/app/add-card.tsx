import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Switch, Alert } from "react-native";
import type { MoveCard, RouteStep, RouteStepType } from '../types/card';
import { useCards } from "../context/CardContext";
import ColorPicker, { HueSlider, OpacitySlider, Panel1, Preview } from "reanimated-color-picker";
//지하철
import { getSubwayDirectionOptions, searchSubwayStations } from "../api/subwayApi";
import type { SubwayDirectionOption, SubwayStation } from "../api/subwayApi";
import { getSubwayLineBadgeText, getSubwayLineColor } from "../utils/subwayLineStyle";
//버스정류장
import { BusStop, searchBusStop } from "../api/busStopApi"; // 수도권 제외
import { getSeoulBusRouteStops, searchSeoulBusRoutes } from "@/api/seoulBusApi"; // 수도권
import type { SeoulBusRoute, SeoulBusRouteStop } from "@/api/seoulBusApi";

export default function AddCardScreen() {

  const { addCard } = useCards();

  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("이름");
  const [cardColor, setCardColor] = useState("rgba(213, 213, 214, 0.5)");
  const [isColoredSelected, setIsColoredSelected] = useState(false);
  const [useRoute, setUseRoute] = useState(false);

  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  //지하철
  const [stepType, setStepType] = useState<RouteStepType>('subway');
  const [stepName, setStepName] = useState('');
  const [stepDetail, setStepDetail] = useState('');
  const [stationKeyword, setStationKeyword] = useState('');
  const [stationResults, setStationResults] = useState<SubwayStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<SubwayStation | null>(null);
  const [isSearchingStation, setIsSearchingStation] = useState(false);
  const [directionOptions, setDirectionOptions] = useState<SubwayDirectionOption[]>([]);
  const [selectedDirectionOption, setSelectedDirectionOption] =
    useState<SubwayDirectionOption | null>(null);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  //버스
  const [busKeyword, setBusKeyWord] = useState("");
  const [busStopResults, setBusStopResults] = useState<BusStop[]>([]);
  const [selectBusStop, setSelectedBusStop] = useState<BusStop | null>(null);
  const [isSearchingBusStop, setIsSearchingBusStop] = useState(false);
  //버스 수도권
  const [seoulBusRouteResults, setSeoulBusRouteResults] = useState<SeoulBusRoute[]>([]);
  const [selectedSeoulBusRoute, setSelectedSeoulBusRoute] = useState<SeoulBusRoute | null>(null);
  const [seoulBusRouteStops, setSeoulBusRouteStops] = useState<SeoulBusRouteStop[]>([]);
  const [boardingStopKeyword, setBoardingStopKeyword] = useState("");
  const [alightingStopKeyword, setAlightingStopKeyword] = useState("");
  const [selectedBoardingStop, setSelectedBoardingStop] = useState<SeoulBusRouteStop | null>(null);
  const [selectedAlightingStop, setSelectedAlightingStop] = useState<SeoulBusRouteStop | null>(null);
  const [isLoadingSeoulBusRouteStops, setIsLoadingSeoulBusRouteStops] = useState(false);
  //도보
  const [walkDetail, setWalkDetail] = useState("");

  const trimmedName = name.trim();
  const previewName = trimmedName || savedName;
  const trimmedStepName = stepName.trim();
  const canSearchSeoulBusRoute =
    !!busKeyword.trim() &&
    !!boardingStopKeyword.trim() &&
    !!alightingStopKeyword.trim();
  const canAddRouteStep =
    stepType === 'subway'
      ? !!selectedStation && !!selectedDirectionOption
      : stepType === 'bus'
        ? !!selectedSeoulBusRoute && !!selectedBoardingStop && !!selectedAlightingStop
        : !!trimmedStepName;

  const boardingStopResults = boardingStopKeyword.trim()
    ? seoulBusRouteStops
        .filter((stop) => stop.stationNm.includes(boardingStopKeyword.trim()))
        .slice(0, 20)
    : [];

  const alightingStopResults =
    selectedBoardingStop && alightingStopKeyword.trim()
      ? seoulBusRouteStops
          .filter((stop) => {
            return (
              stop.stationNm.includes(alightingStopKeyword.trim()) &&
              Number(stop.seq) > Number(selectedBoardingStop.seq)
            );
          })
          .slice(0, 20)
      : [];

  function handleSave() {
    if (!trimmedName) {
      Alert.alert("카드 생성 필수조건을 입력해주세요!")
      return;
    }

    const newCard: MoveCard = {
      id: Date.now().toString(),
      name: trimmedName,
      color: cardColor,
      icon: "bus",
      useRoute,
      routeSteps: useRoute ? routeSteps : [],
    };

    console.log("새 카드:", newCard);

    addCard(newCard);

    setSavedName(trimmedName);
    setName("");
    router.back();
  }
  function handleAddRouteStep() {
    if (!canAddRouteStep) {
      return;
    }

    if (stepType === 'subway') {
      if (!selectedStation || !selectedDirectionOption) {
        return;
      }

      const nextStep: RouteStep = {
        id: Date.now().toString(),
        type: 'subway',
        name: `${selectedStation.lineName} ${selectedStation.stationName}역`,
        detail: selectedDirectionOption.label,
        lineName: selectedStation.lineName,
        subwayId: selectedStation.subwayId,
        stationName: selectedStation.stationName,
        stationCode: selectedStation.stationCode,
        subwayDirection: selectedDirectionOption.direction,
      };

      setRouteSteps((prevSteps) => [...prevSteps, nextStep]);

      setStationKeyword('');
      setStationResults([]);
      setSelectedStation(null);
      setDirectionOptions([]);
      setSelectedDirectionOption(null);

      return;
    }

    if (stepType === 'bus') {
      if (
        !selectedSeoulBusRoute ||
        !selectedBoardingStop ||
        !selectedAlightingStop
      ) {
        return;
      }

      const nextStep: RouteStep = {
        id: Date.now().toString(),
        type: 'bus',
        name: selectedSeoulBusRoute.busRouteNm,
        detail: `${selectedBoardingStop.stationNm} → ${selectedAlightingStop.stationNm}`,
        busNumber: selectedSeoulBusRoute.busRouteNm,
        busStopName: selectedBoardingStop.stationNm,
        busRouteId: selectedSeoulBusRoute.busRouteId,
        boardingStopName: selectedBoardingStop.stationNm,
        boardingStopId: selectedBoardingStop.station,
        boardingStopArsId: selectedBoardingStop.arsId,
        boardingStopOrder: Number(selectedBoardingStop.seq),
        alightingStopName: selectedAlightingStop.stationNm,
        alightingStopId: selectedAlightingStop.station,
        alightingStopArsId: selectedAlightingStop.arsId,
        alightingStopOrder: Number(selectedAlightingStop.seq),
      };

      setRouteSteps((prevSteps) => [...prevSteps, nextStep]);

      setBusKeyWord('');
      setSeoulBusRouteResults([]);
      setSelectedSeoulBusRoute(null);
      setSeoulBusRouteStops([]);
      setBoardingStopKeyword('');
      setAlightingStopKeyword('');
      setSelectedBoardingStop(null);
      setSelectedAlightingStop(null);

      return;
    }

    const trimmedStepDetail = stepDetail.trim();

    const nextStep: RouteStep = {
      id: Date.now().toString(),
      type: stepType,
      name: trimmedStepName,
      detail: trimmedStepDetail,
    };

    setRouteSteps((prevSteps) => [...prevSteps, nextStep]);

    setStepName('');
    setStepDetail('');
  }
  async function handleSearchStation() {
    try {
      setIsSearchingStation(true);

      setSelectedStation(null);
      setDirectionOptions([]);
      setSelectedDirectionOption(null);

      const results = await searchSubwayStations(stationKeyword);

      setStationResults(results);
    } catch (error) {
      console.log('역 검색 실패:', error);
      Alert.alert('역 검색에 실패했습니다.');
    } finally {
      setIsSearchingStation(false);
    }
  }
  async function handleSelectStation(station: SubwayStation) {
    try {
      setSelectedStation(station);
      setSelectedDirectionOption(null);
      setDirectionOptions([]);
      setIsLoadingDirections(true);

      const options = await getSubwayDirectionOptions(
        station.stationName,
        station.lineName
      );

      console.log('방향 후보:', options);

      setDirectionOptions(options);
    } catch (error) {
      console.log('방향 후보 조회 실패:', error);
      Alert.alert('방향 후보 조회에 실패했습니다.');
    } finally {
      setIsLoadingDirections(false);
    }
  }
  //버스 수도권 제외
  async function handleSearchBusStop() {
    try {
      setIsSearchingBusStop(true);

      const rusults = await searchBusStop(busKeyword);
      setBusStopResults(rusults);
    } catch (error) {
      console.log("버스정류장 검색 실패:", error)
    } finally {
      setIsSearchingBusStop(false);
    }
  }
  //버스 수도권
  async function handleSearchSeoulBusRoute() {
    if (!canSearchSeoulBusRoute) {
      return;
    }

    try {
      setIsSearchingBusStop(true);

      setSelectedSeoulBusRoute(null);
      setSeoulBusRouteStops([]);
      setSelectedBoardingStop(null);
      setSelectedAlightingStop(null);

      const routes = await searchSeoulBusRoutes(busKeyword);
      setSeoulBusRouteResults(routes);

      console.log("add-card에 저장된 서울노선:", routes);
    } catch (error) {
      console.log(
        "서울 버스 노선 검색 실패:",
        error
      );
    } finally {
      setIsSearchingBusStop(false);
    }
  }

  async function handleSelectSeoulBusRoute(route: SeoulBusRoute) {
    try {
      setSelectedSeoulBusRoute(route);
      setSeoulBusRouteStops([]);
      setSelectedBoardingStop(null);
      setSelectedAlightingStop(null);
      setIsLoadingSeoulBusRouteStops(true);

      const stops = await getSeoulBusRouteStops(route.busRouteId);
      setSeoulBusRouteStops(stops);
    } catch (error) {
      console.log("서울 버스 노선별 정류장 조회 실패:", error);
      Alert.alert("버스 정류장 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingSeoulBusRouteStops(false);
    }
  }

  function handleSelectBoardingStop(stop: SeoulBusRouteStop) {
    setSelectedBoardingStop(stop);
    setBoardingStopKeyword(stop.stationNm);
    setSelectedAlightingStop(null);
  }

  function handleSelectAlightingStop(stop: SeoulBusRouteStop) {
    if (
      selectedBoardingStop &&
      Number(stop.seq) <= Number(selectedBoardingStop.seq)
    ) {
      Alert.alert("하차 정류장은 승차 정류장 이후에서 선택해 주세요.");
      return;
    }

    setSelectedAlightingStop(stop);
    setAlightingStopKeyword(stop.stationNm);
  }

  //도보
  function handleWalkMemo() {
    return(
      <>
      </>
    )
  }

  function handleColorChange({ rgba }: { rgba: string }) {
    setCardColor(rgba);
    setIsColoredSelected(true);
  }
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
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

        <Text style={texts.title}>카드 생성</Text>

        <View style={objects.previewSection}>
          <View style={[
            objects.emptyCard,
            isColoredSelected && {
              backgroundColor: cardColor,
              borderStyle: "solid"
            }
          ]}>
            <Text selectable style={texts.cardName}>
              {previewName}
            </Text>
          </View>
        </View>

        <View style={objects.formSection}>
          <Text style={texts.label}>카드 이름</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleSave}
            placeholder="카드 이름을 입력하세요"
            maxLength={20}
            returnKeyType="done"
            style={objects.nameInput}
          />
          <View>
            <Text style={texts.label}>카드를 꾸며보세요</Text>
            <ColorPicker
              value={cardColor}

              thumbSize={26}
              boundedThumb
              onChangeJS={handleColorChange}
              style={{
                width: "100%",
                gap: 14,
                marginTop: 10
              }}
            >
              <Panel1
                accessibilityLabel="카드 색상 채도와 밝기 선택"
                style={{
                  borderRadius: 15
                }}
              />
              <HueSlider
                accessibilityLabel="카드 색조 선택"
                style={{
                  borderRadius: 15
                }}
              />
              <OpacitySlider
                accessibilityLabel="카드 불투명도 선택"
                style={{
                  borderRadius: 15
                }}
              />
              <Preview
                hideInitialColor
                colorFormat="hex"
                style={{
                  borderRadius: 15
                }}
              />

            </ColorPicker>
          </View>
          <View style={objects.routeToggleRow}>
            <View>
              <Text style={texts.sectionTitle}>경로 정보 추가</Text>
              <Text style={texts.sectionDescription}>
                카드 안에 지하철, 버스, 도보 단계를 넣을 수 있어요.
              </Text>
            </View>

            <Switch
              value={useRoute}
              onValueChange={setUseRoute}
              trackColor={{ false: '#2A3442', true: '#2F6BFF' }}
              thumbColor={useRoute ? '#FFFFFF' : '#A8B0BD'}
            />
          </View>
          {useRoute && (
            <View style={objects.routeForm}>
              <Text style={texts.sectionTitle}>경로 단계 입력</Text>

              <View style={objects.stepTypeRow}>
                <Pressable
                  style={[
                    objects.stepTypeButton,
                    stepType === 'subway' && objects.stepTypeButtonActive,
                  ]}
                  onPress={() => setStepType('subway')}
                >
                  <Text
                    style={[
                      texts.stepTypeText,
                      stepType === 'subway' && texts.stepTypeTextActive,
                    ]}
                  >
                    지하철
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    objects.stepTypeButton,
                    stepType === 'bus' && objects.stepTypeButtonActive,
                  ]}
                  onPress={() => setStepType('bus')}
                >
                  <Text
                    style={[
                      texts.stepTypeText,
                      stepType === 'bus' && texts.stepTypeTextActive,
                    ]}
                  >
                    버스
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    objects.stepTypeButton,
                    stepType === 'walk' && objects.stepTypeButtonActive,
                  ]}
                  onPress={() => setStepType('walk')}
                >
                  <Text
                    style={[
                      texts.stepTypeText,
                      stepType === 'walk' && texts.stepTypeTextActive,
                    ]}
                  >
                    도보
                  </Text>
                </Pressable>
              </View>

              {stepType === 'subway' && (
                <View style={objects.transportSearchBoxBox}>
                  <TextInput
                    style={objects.routeInput}
                    placeholder="역 이름 검색 예: 강남"
                    placeholderTextColor="#7D8797"
                    value={stationKeyword}
                    onChangeText={setStationKeyword}
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="지하철 역 검색"
                    onPress={handleSearchStation}
                    style={objects.searchButton}
                  >
                    <Text style={texts.searchButtonLabel}>
                      {isSearchingStation ? '검색 중...' : '역 검색'}
                    </Text>
                  </Pressable>

                  {stationResults.map((station) => {
                    const isSelected =
                      selectedStation?.stationCode === station.stationCode &&
                      selectedStation?.lineName === station.lineName;

                    return (
                      <Pressable
                        key={`${station.lineName}-${station.stationName}-${station.stationCode}`}
                        style={[
                          objects.stationResultButton,
                          isSelected && objects.stationResultButtonActive,
                        ]}
                        onPress={() => handleSelectStation(station)}
                      >
                        <Text
                          style={[
                            texts.stationResultTitle,
                            isSelected && texts.stationResultTitleActive,
                          ]}
                        >
                          {station.lineName} {station.stationName}역
                        </Text>

                        <Text style={texts.stationResultMeta}>
                          역 코드 {station.stationCode ?? '정보 없음'}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {selectedStation ? (
                    <View style={objects.directionSection}>
                      <View style={objects.selectedStationPill}>
                        <View
                          style={[
                            objects.selectedStationBadge,
                            { backgroundColor: getSubwayLineColor(selectedStation.lineName) },
                          ]}
                        >
                          <Text style={texts.selectedStationBadgeText}>
                            {getSubwayLineBadgeText(selectedStation.lineName)}
                          </Text>
                        </View>

                        <View style={objects.selectedStationTextBox}>
                          <Text style={texts.selectedStationLabel}>선택된 역</Text>
                          <Text style={texts.selectedStationName}>
                            {selectedStation.lineName} {selectedStation.stationName}역
                          </Text>
                        </View>
                      </View>

                      <Text style={texts.directionTitle}>방향 선택</Text>

                      {isLoadingDirections ? (
                        <Text style={texts.stationResultMeta}>방향 후보 불러오는 중...</Text>
                      ) : null}

                      {selectedStation && !isLoadingDirections && directionOptions.length === 0 ? (
                        <Text style={texts.stationResultMeta}>
                          선택 가능한 방향 후보가 없습니다.
                        </Text>
                      ) : null}

                      {directionOptions.map((option) => {
                        const isSelected = selectedDirectionOption?.label === option.label;

                        return (
                          <Pressable
                            key={option.label}
                            style={[
                              objects.directionOptionButton,
                              isSelected && objects.directionOptionButtonActive,
                            ]}
                            onPress={() => setSelectedDirectionOption(option)}
                          >
                            <Text
                              style={[
                                texts.directionOptionTitle,
                                isSelected && texts.directionOptionTitleActive,
                              ]}
                            >
                              {option.label}
                            </Text>

                            <Text
                              style={[
                                texts.directionOptionMeta,
                                isSelected && texts.directionOptionMetaActive,
                              ]}
                            >
                              행선지 {option.destination}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              )}
              {stepType === 'bus' && (
                <View style={objects.transportSearchBoxBox}>
                  <TextInput
                    style={objects.routeInput}
                    placeholder={"버스 번호 검색 예: 2230"}
                    placeholderTextColor="#7D8797"
                    value={busKeyword}
                    onChangeText={setBusKeyWord}
                  />
                  <TextInput
                    style={objects.routeInput}
                    placeholder={"승차 정류장 이름"}
                    placeholderTextColor="#7D8797"
                    value={boardingStopKeyword}
                    onChangeText={(value) => {
                      setBoardingStopKeyword(value);
                      setSelectedBoardingStop(null);
                      setSelectedAlightingStop(null);
                    }}
                  />
                  <TextInput
                    style={objects.routeInput}
                    placeholder={"하차 정류장 이름"}
                    placeholderTextColor="#7D8797"
                    value={alightingStopKeyword}
                    onChangeText={(value) => {
                      setAlightingStopKeyword(value);
                      setSelectedAlightingStop(null);
                    }}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="서울 버스 노선 검색"
                    accessibilityState={{ disabled: !canSearchSeoulBusRoute }}
                    disabled={!canSearchSeoulBusRoute}
                    onPress={handleSearchSeoulBusRoute}
                    style={[
                      objects.searchButton,
                      !canSearchSeoulBusRoute && objects.addRouteButtonDisabled,
                    ]}
                    >
                    <Text style={texts.searchButtonLabel}>
                      {isSearchingBusStop ? '검색 중...' : '버스 검색'}
                    </Text>
                  </Pressable>

                  {seoulBusRouteResults.map((route) => {
                    const isSelected =
                      selectedSeoulBusRoute?.busRouteId === route.busRouteId;

                    return (
                      <Pressable
                        key={route.busRouteId}
                        style={[
                          objects.stationResultButton,
                          isSelected && objects.stationResultButtonActive,
                        ]}
                        onPress={() => handleSelectSeoulBusRoute(route)}
                      >
                        <Text
                          style={[
                            texts.stationResultTitle,
                            isSelected && texts.stationResultTitleActive,
                          ]}
                        >
                          {route.busRouteNm}
                        </Text>

                        <Text style={texts.stationResultMeta}>
                          {route.stStationNm} → {route.edStationNm}
                        </Text>
                      </Pressable>
                    );
                  })}

                  {selectedSeoulBusRoute ? (
                    <View style={objects.directionSection}>
                      <View style={objects.selectedStationPill}>
                        <View
                          style={[
                            objects.selectedStationBadge,
                            { backgroundColor: '#2563EB' },
                          ]}
                        >
                          <Text style={texts.selectedStationBadgeText}>버스</Text>
                        </View>

                        <View style={objects.selectedStationTextBox}>
                          <Text style={texts.selectedStationLabel}>선택한 노선</Text>
                          <Text style={texts.selectedStationName}>
                            {selectedSeoulBusRoute.busRouteNm}
                          </Text>
                          <Text style={texts.stationResultMeta}>
                            {selectedSeoulBusRoute.stStationNm} → {selectedSeoulBusRoute.edStationNm}
                          </Text>
                        </View>
                      </View>

                      {isLoadingSeoulBusRouteStops ? (
                        <Text style={texts.stationResultMeta}>
                          노선 정류장 불러오는 중...
                        </Text>
                      ) : (
                        <>
                          <Text style={texts.directionTitle}>승차 정류장</Text>

                          {boardingStopResults.map((stop) => {
                            const isSelected =
                              selectedBoardingStop?.station === stop.station &&
                              selectedBoardingStop?.seq === stop.seq;

                            return (
                              <Pressable
                                key={`boarding-${stop.station}-${stop.seq}`}
                                style={[
                                  objects.stationResultButton,
                                  isSelected && objects.stationResultButtonActive,
                                ]}
                                onPress={() => handleSelectBoardingStop(stop)}
                              >
                                <Text
                                  style={[
                                    texts.stationResultTitle,
                                    isSelected && texts.stationResultTitleActive,
                                  ]}
                                >
                                  {stop.stationNm}
                                </Text>
                                <Text style={texts.stationResultMeta}>
                                  {stop.arsId || stop.stationNo || '정류장 번호 없음'} · {stop.direction} 방향
                                </Text>
                              </Pressable>
                            );
                          })}

                          {boardingStopKeyword.trim() && boardingStopResults.length === 0 ? (
                            <Text style={texts.stationResultMeta}>
                              이 노선에서 일치하는 승차 정류장을 찾지 못했습니다.
                            </Text>
                          ) : null}

                          {selectedBoardingStop ? (
                            <>
                              <Text style={texts.directionTitle}>하차 정류장</Text>

                              {alightingStopResults.map((stop) => {
                                const isSelected =
                                  selectedAlightingStop?.station === stop.station &&
                                  selectedAlightingStop?.seq === stop.seq;

                                return (
                                  <Pressable
                                    key={`alighting-${stop.station}-${stop.seq}`}
                                    style={[
                                      objects.stationResultButton,
                                      isSelected && objects.stationResultButtonActive,
                                    ]}
                                    onPress={() => handleSelectAlightingStop(stop)}
                                  >
                                    <Text
                                      style={[
                                        texts.stationResultTitle,
                                        isSelected && texts.stationResultTitleActive,
                                      ]}
                                    >
                                      {stop.stationNm}
                                    </Text>
                                    <Text style={texts.stationResultMeta}>
                                      {stop.arsId || stop.stationNo || '정류장 번호 없음'} · {stop.direction} 방향
                                    </Text>
                                  </Pressable>
                                );
                              })}

                              {alightingStopKeyword.trim() && alightingStopResults.length === 0 ? (
                                <Text style={texts.stationResultMeta}>
                                  승차 정류장 이후에서 일치하는 하차 정류장을 찾지 못했습니다.
                                </Text>
                              ) : null}
                            </>
                          ) : null}
                        </>
                      )}
                    </View>
                  ) : null}
                </View>
              )}
              {stepType === 'walk' && (
                <View style={objects.transportSearchBoxBox}>
                  <TextInput
                    style={objects.routeInput}
                    placeholder={"걷기 정보 세부사항 예: 앞으로 쭉 걷기"}
                    placeholderTextColor="#7D8797"
                    value={walkDetail}
                    onChangeText={setWalkDetail}
                  />
                  <Pressable
                    onPress={handleWalkMemo}
                    style={objects.searchButton}
                    >
                    <Text style={texts.searchButtonLabel}>
                      메모 저장
                    </Text>
                  </Pressable>
                  {busStopResults.map((busStop) => (
                    <Pressable
                      key={busStop.id}
                      onPress={() => setSelectedBusStop(busStop)}
                    >
                      <Text>{busStop.name}</Text>
                      <Text>{busStop.number}</Text>
                    </Pressable>
                  ))}
                </View>
              )}


              <Pressable
                accessibilityRole="button"
                accessibilityLabel="경로 단계 추가"
                accessibilityState={{ disabled: !canAddRouteStep }}
                disabled={!canAddRouteStep}
                onPress={handleAddRouteStep}
                style={({ pressed }) => [
                  objects.addRouteButton,
                  !canAddRouteStep && objects.addRouteButtonDisabled,
                  pressed && canAddRouteStep && objects.addRouteButtonPressed,
                ]}
              >
                <Text style={texts.addRouteButtonLabel}>경로 단계 추가</Text>
              </Pressable>
              {routeSteps.length > 0 && (
                <View style={objects.routeStepList}>
                  <Text style={texts.sectionTitle}>추가된 경로</Text>

                  {routeSteps.map((step, index) => (
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

                          {step.type === 'subway' ? (
                            <Ionicons
                              name="train-outline"
                              size={30}
                              color="#6B7280"
                            />
                          ) : null}
                        </View>

                        <Text style={texts.routeStepDetail}>{step.detail}</Text>
                      </View>


                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="카드 이름 저장"
            accessibilityState={{ disabled: !trimmedName }}
            disabled={!trimmedName}
            onPress={handleSave}
            style={({ pressed }) => [
              objects.saveButton,
              !trimmedName && objects.saveButtonDisabled,
              pressed && trimmedName && objects.saveButtonPressed,
            ]}
          >
            <Text style={texts.saveButtonLabel}>저장</Text>
          </Pressable>
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
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
  },
  previewSection: {
    width: "100%",
    alignItems: "center",
  },
  emptyCard: {
    width: 214,
    height: 340,
    padding: 15,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(10, 10, 10, 0.45)",
    borderRadius: 16,
    backgroundColor: "rgba(213, 213, 214, 0.5)",
  },
  formSection: {
    width: "100%",
    gap: 10,
    paddingTop: 4,
  },
  nameInput: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  routeInput: {
    width: "100%",
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  saveButtonDisabled: {
    opacity: 0.35,
  },
  saveButtonPressed: {
    opacity: 0.75,
  },
  addRouteButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  addRouteButtonDisabled: {
    opacity: 0.35,
  },

  addRouteButtonPressed: {
    opacity: 0.75,
  },
  routeToggleRow: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  routeForm: {
    marginTop: 14,
    gap: 10,
  },
  stepTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepTypeButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepTypeButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  routeStepList: {
    gap: 8,
    marginTop: 8,
  },

  routeStepItem: {
    minHeight: 58,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "transparent",
  },

  routeStepContent: {
    flex: 1,
    gap: 2,
  },
  transportSearchBoxBox: {
    gap: 8,
  },

  searchButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  stationResultButton: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 4,
  },

  stationResultButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  routeStepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  directionSection: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },

  directionHeader: {
    gap: 2,
  },

  directionOptionButton: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 4,
  },

  directionOptionButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  selectedStationPill: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE3EA",
    gap: 10,
  },

  selectedStationBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedStationTextBox: {
    flex: 1,
    gap: 2,
  }
});

const texts = StyleSheet.create({
  title: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  saveButtonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  helperText: {
    color: "#6B7280",
    fontSize: 13,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  stepTypeText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '800',
  },
  stepTypeTextActive: {
    color: '#FFFFFF',
  },
  addRouteButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  routeStepBadgeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  routeStepName: {
    color: "#111827",
    fontSize: 14,
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
  searchButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  stationResultTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },

  stationResultTitleActive: {
    color: "#2563EB",
  },

  stationResultMeta: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  directionTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  directionSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },

  directionOptionTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },

  directionOptionTitleActive: {
    color: "#FFFFFF",
  },

  directionOptionMeta: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },

  directionOptionMetaActive: {
    color: "#D1D5DB",
  },
  selectedStationLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
  },

  selectedStationName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  selectedStationBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});



