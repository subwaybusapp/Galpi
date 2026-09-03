import { XMLParser } from "fast-xml-parser";

// 화면에서 사용할 버스 도착정보 모양
export type SeoulBusArrival = {
  firstMessage: string;
  secondMessage: string;

  firstArrivalSeconds: number;
  secondArrivalSeconds: number;

  firstVehicleNumber: string;
  secondVehicleNumber: string;

  fetchedAt: number;
};

// 서울 버스 노선별 정류소 도착정보 주소
const BUS_ARRIVAL_URL =
  "http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute";

// 기존 서울 버스 API와 같은 인증키 사용
const API_KEY =
  process.env.EXPO_PUBLIC_SEOUL_BUS_API_KEY;

// XML 문자열을 자바스크립트 객체로 바꾸는 도구
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false,
});

// 특정 정류장에 특정 버스가 언제 오는지 조회
export async function getSeoulBusArrival(
  stId: string,
  busRouteId: string,
  ord: number
): Promise<SeoulBusArrival | null> {
  if (!API_KEY) {
    throw new Error(
      "서울 버스 API 키가 설정되지 않았습니다."
    );
  }

  if (!stId || !busRouteId || !ord) {
    throw new Error(
      "버스 도착정보 요청값이 부족합니다."
    );
  }

  // 인증키를 제외한 요청변수 만들기
  const params = new URLSearchParams({
    stId,
    busRouteId,
    ord: String(ord),
  });

  // 인증키는 이미 URL Encode된 상태라 URLSearchParams에 넣지 않음
  const requestUrl =
    `${BUS_ARRIVAL_URL}?serviceKey=${API_KEY}&${params.toString()}`;

  const response = await fetch(requestUrl);
  const rawXml = await response.text();

  console.log(
    "서울 버스 도착 원본 응답:",
    rawXml
  );

  if (!response.ok) {
    throw new Error(
      `서울 버스 도착정보 요청 실패: ${response.status}`
    );
  }

  // XML을 자바스크립트 객체로 변환
  const data = xmlParser.parse(rawXml);
  const serviceResult = data.ServiceResult;

  if (!serviceResult) {
    throw new Error(
      "서울 버스 도착정보 응답 형식이 올바르지 않습니다."
    );
  }

  // 서울 API가 정상적으로 처리했는지 확인
  if (serviceResult.msgHeader?.headerCd !== "0") {
    throw new Error(
      serviceResult.msgHeader?.headerMsg ??
        "서울 버스 도착정보 조회에 실패했습니다."
    );
  }

  const itemList =
    serviceResult.msgBody?.itemList;

  // 현재 도착 예정 버스가 없는 경우
  if (!itemList) {
    return null;
  }

  // 하나여도 배열로 올 수 있으므로 첫 번째 결과 사용
  const item = Array.isArray(itemList)
    ? itemList[0]
    : itemList;

  const arrival: SeoulBusArrival = {
    firstMessage: String(
      item.arrmsg1 ?? "첫 번째 도착정보 없음"
    ),
    secondMessage: String(
      item.arrmsg2 ?? "두 번째 도착정보 없음"
    ),

    firstArrivalSeconds: Number(
      item.traTime1 ?? 0
    ),
    secondArrivalSeconds: Number(
      item.traTime2 ?? 0
    ),

    firstVehicleNumber: String(
      item.plainNo1 ?? ""
    ),
    secondVehicleNumber: String(
      item.plainNo2 ?? ""
    ),

    fetchedAt: Date.now(),
  };

  console.log(
    "서울 버스 도착정보:",
    arrival
  );

  return arrival;
}
