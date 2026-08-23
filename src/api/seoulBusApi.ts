// 화면에서 사용할 서울 버스 노선 모양
export type SeoulBusRoute = {
  busRouteId: string;
  busRouteNm: string;
  routeType: string;
  stStationNm: string;
  edStationNm: string;
  term: string;
  corpNm: string;
};

// 선택한 노선이 지나가는 정류장 모양
export type SeoulBusRouteStop = {
  busRouteId: string;
  busRouteNm: string;
  seq: string;
  section: string;
  station: string;
  stationNm: string;
  direction: string;
  stationNo: string;
  arsId?: string;
  transYn?: string;
};

// 서울 버스 노선번호 검색 주소
const ROUTE_SEARCH_URL =
  "http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList";

// 노선별 경유 정류장 검색 주소
const ROUTE_STOPS_URL =
  "http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute";


const API_KEY =
  process.env.EXPO_PUBLIC_SEOUL_BUS_API_KEY;

// 버스번호로 서울 버스 노선을 검색하는 함수
export async function searchSeoulBusRoutes(
  routeNumber: string
): Promise<SeoulBusRoute[]> {

  const keyword = routeNumber.trim();


  if (keyword === "") {
    return [];
  }


  if (!API_KEY) {
    throw new Error(
      "서울 버스 API 키가 설정되지 않았습니다."
    );
  }


  const params = new URLSearchParams({
    strSrch: keyword,
    resultType: "json",
  });


  const requestUrl = `${ROUTE_SEARCH_URL}?serviceKey=${API_KEY}&${params.toString()}`;


  const response = await fetch(requestUrl);


  const rawText = await response.text();

  console.log(
    "서울 버스 노선 원본 응답:",
    rawText
  );

  if (!response.ok) {
    throw new Error(
      `서울 버스 노선 요청 실패: ${response.status}`
    );
  }

  // JSON 문자열을 자바스크립트 객체로 변환
  const data = JSON.parse(rawText);

  if (data.msgHeader?.headerCd !== "0") {
    throw new Error(
      data.msgHeader?.headerMsg ??
      "서울 버스 노선 조회에 실패했습니다."
    );
  }

  // 응답에서 노선 목록만 가져오기
  const routes = normalizeItemList<SeoulBusRoute>(
    data.msgBody?.itemList
  );

  // 배열이 제대로 만들어졌는지 확인
  console.log(
  "서울 버스 노선 배열:",
  routes
  );

  return routes;
}

// 선택한 서울 버스 노선이 지나는 전체 정류장 조회
export async function getSeoulBusRouteStops(
  busRouteId: string
): Promise<SeoulBusRouteStop[]> {
  if (!API_KEY) {
    throw new Error(
      "서울 버스 API 키가 설정되지 않았습니다."
    );
  }

  const params = new URLSearchParams({
    busRouteId,
    resultType: "json",
  });

  const requestUrl =
    `${ROUTE_STOPS_URL}?serviceKey=${API_KEY}&${params.toString()}`;

  const response = await fetch(requestUrl);
  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `서울 버스 정류장 요청 실패: ${response.status}`
    );
  }

  const data = JSON.parse(rawText);

  if (data.msgHeader?.headerCd !== "0") {
    throw new Error(
      data.msgHeader?.headerMsg ??
      "서울 버스 정류장 조회에 실패했습니다."
    );
  }

  const stops = normalizeItemList<SeoulBusRouteStop>(
    data.msgBody?.itemList
  );

  console.log(
    "서울 버스 노선별 정류장 배열:",
    stops
  );

  return stops;
}

// API가 결과 한 개를 객체로 줄 때도 항상 배열로 맞춤
function normalizeItemList<T>(
  itemList: T[] | T | "" | null | undefined
): T[] {
  if (!itemList) {
    return [];
  }

  return Array.isArray(itemList)
    ? itemList
    : [itemList];
}
