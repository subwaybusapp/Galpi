// 정류장 검색 API 주소
const API_URL =
  "https://apis.data.go.kr/1613000/BusSttnInfoInqireService/getSttnNoList";

// .env에서 API 키 가져오기
const API_KEY =
  process.env.EXPO_PUBLIC_DATA_GO_KR_API_KEY;

// 서울특별시 도시코드
const CITY_CODE = "21";


// 화면에서 사용할 정류장 정보
export type BusStop = {
  id: string;
  name: string;
  number: string;
};


// 정류장 이름으로 검색하는 함수
export async function searchBusStop(
  stationName: string
): Promise<BusStop[]> {

  // 입력한 검색어의 앞뒤 빈칸 제거
  const keyword = stationName.trim();

  // 검색어가 없으면 빈 목록 반환
  if (keyword === "") {
    return [];
  }

  // API 키가 없으면 오류 발생
  if (!API_KEY) {
    throw new Error("API 키가 설정되지 않았습니다.");
  }


  // API에 보낼 요청 조건
  const params = new URLSearchParams({
    _type: "json",
    cityCode: CITY_CODE,
    nodeNm: keyword,
    pageNo: "1",
    numOfRows: "20",
  });

  // API 주소와 요청 조건 연결
  const requestUrl =`${API_URL}?serviceKey=${API_KEY}&${params.toString()}`;

  // API에 요청 보내기
  const response = await fetch(requestUrl);


  // 요청 자체가 실패한 경우
  if (!response.ok) {
    throw new Error("정류장 검색 요청에 실패했습니다.");
  }


  // 받은 응답을 JSON으로 변환
  const data = await response.json();

  console.log(
    "API 원본 응답:",
    JSON.stringify(data, null, 2)
  );

  if (!data.response) {
    throw new Error(
      "예상하지 못한 API 응답입니다."
    );
  }

  // 공공데이터 API가 오류를 반환한 경우
  if (data.response.header.resultCode !== "00") {
    throw new Error(data.response.header.resultMsg);
  }


  // 검색 결과가 없으면 빈 목록 반환
  if (!data.response.body.items) {
    return [];
  }


  // 정류장 데이터 꺼내기
  const itemData =
    data.response.body.items.item;


  // 결과가 하나여도 배열로 만들기
  const items = Array.isArray(itemData)
    ? itemData
    : [itemData];


  // 필요한 정보만 정리해서 반환
  const BusStops = items.map((item: any) => {
    return {
      id: item.nodeid,
      name: item.nodenm,
      number: item.nodeno || "번호 없음",
    };
  });

  console.log("정류장 검색 결과", BusStops);
  return BusStops;
}