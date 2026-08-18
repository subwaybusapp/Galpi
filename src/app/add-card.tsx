import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Switch } from "react-native";
import type { MoveCard, RouteStep, RouteStepType } from '../types/card';
import { useCards } from "../context/CardContext";

export default function AddCardScreen() {

  const { addCard } = useCards();

  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("이름");
  const [useRoute, setUseRoute] = useState(false);

  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);

  const [stepType, setStepType] = useState<RouteStepType>('subway');
  const [stepName, setStepName] = useState('');
  const [lineName, setLineName] = useState('');
  const [stepDetail, setStepDetail] = useState('');
  const [stepMinutes, setStepMinutes] = useState('');



  const trimmedName = name.trim();
  const previewName = trimmedName || savedName;
  const trimmedStepName = stepName.trim();
  const canAddRouteStep = !!trimmedStepName;

  function handleSave() {
    if (!trimmedName) {
      return;
    }

    const newCard: MoveCard = {
      id: Date.now().toString(),
      name: trimmedName,
      color: "#2F6BFF",
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
    const trimmedStepDetail = stepDetail.trim();
    const trimmedLineName = lineName.trim();

    if (!canAddRouteStep) {
      return;
    }

    const nextStep: RouteStep = {
      id: Date.now().toString(),
      type: stepType,
      name:
        stepType === 'subway' && trimmedLineName
          ? `${trimmedLineName} ${trimmedStepName}`
          : trimmedStepName,
      detail: trimmedStepDetail,
      minutes: stepMinutes ? Number(stepMinutes) : undefined,
      lineName: stepType === 'subway' ? trimmedLineName : undefined,
      stationName: stepType === 'subway' ? trimmedStepName : undefined,
    };
    setRouteSteps((prevSteps) => [...prevSteps, nextStep]);

    setLineName("");
    setStepName("");
    setStepDetail("");
    setStepMinutes("");
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
          <View style={objects.emptyCard}>
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
                <TextInput
                  style={objects.routeInput}
                  placeholder="호선 예: 2호선"
                  placeholderTextColor="#7D8797"
                  value={lineName}
                  onChangeText={setLineName}
                />
              )}

              <TextInput
                style={objects.routeInput}
                placeholder={
                  stepType === 'subway'
                    ? '역 이름 예: 강남역'
                    : stepType === 'bus'
                      ? '버스 번호/정류장 예: 146번'
                      : '도보 구간 예: 집에서 상봉역'
                }
                placeholderTextColor="#7D8797"
                value={stepName}
                onChangeText={setStepName}
              />

              <TextInput
                style={objects.routeInput}
                placeholder={
                  stepType === 'subway'
                    ? '방향 예: 홍대입구 방면'
                    : stepType === 'bus'
                      ? '설명 예: 강남역 정류장 승차'
                      : '설명 예: 약 5분 이동'
                }
                placeholderTextColor="#7D8797"
                value={stepDetail}
                onChangeText={setStepDetail}
              />

              <TextInput
                style={objects.routeInput}
                placeholder="예상 소요시간 예: 18"
                placeholderTextColor="#7D8797"
                value={stepMinutes}
                onChangeText={setStepMinutes}
                keyboardType="number-pad"
              />

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

          <Text selectable style={texts.helperText}>
            저장된 이름: {savedName}
          </Text>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F6BFF",
  },

  routeStepContent: {
    flex: 1,
    gap: 2,
  },
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
    fontSize: 12,
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
});



