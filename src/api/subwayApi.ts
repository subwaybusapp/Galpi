export type SubwayStation = {
    stationName: string;
    lineName: string;
    subwayId: string;
    stationCode?: string;
};

export type SubwayArrival = {
    subwayId: string;
    lineName: string;
    stationName: string;
    updnLine: '상행' | '하행' | '내선' | '외선';
    trainLineName: string;
    arrivalMessage: string;
    remainingSeconds: number;
};
export type SubwayDirectionOption = {
    direction: '상행' | '하행' | '내선' | '외선';
    destination: string;
    label: string;
};
export type SubwaySchedule = {
    departureTime: string;
    destination: string;
    label: string;
};

const SEOUL_API_KEY = process.env.EXPO_PUBLIC_SEOUL_API_KEY;

export async function searchSubwayStations(
    keyword: string
): Promise<SubwayStation[]> {
    const trimmedKeyword = keyword.trim().replace(/역$/, '');

    if (!trimmedKeyword) {
        return [];
    }

    const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/SearchSTNBySubwayLineInfo/1/20/%20/${encodeURIComponent(trimmedKeyword)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('지하철 역 검색에 실패했습니다.');
    }

    const data = await response.json();

    console.log('역 검색 응답:', data);

    const rows = data.SearchSTNBySubwayLineInfo?.row ?? [];

    return rows.map((row: any) => {
        const normalizedLineName = normalizeLineName(row.LINE_NUM);

        return {
            stationName: row.STATION_NM,
            lineName: normalizedLineName,
            subwayId: getSubwayIdByLineName(normalizedLineName),
            stationCode: row.STATION_CD,
        };
    });
}
export async function getSubwayArrivals(
    stationName: string
): Promise<SubwayArrival[]> {
    const trimmedStationName = stationName.trim().replace(/역$/, '');

    if (!trimmedStationName) {
        return [];
    }

    const url = `http://swopenapi.seoul.go.kr/api/subway/${SEOUL_API_KEY}/json/realtimeStationArrival/0/20/${encodeURIComponent(trimmedStationName)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('지하철 도착정보 조회에 실패했습니다.');
    }

    const data = await response.json();

    console.log('도착정보 응답:', data);

    const rows = data.realtimeArrivalList ?? [];

    return rows.map((row: any) => ({
        subwayId: row.subwayId,
        lineName: row.subwayId,
        stationName: row.statnNm,
        updnLine: row.updnLine,
        trainLineName: row.trainLineNm,
        arrivalMessage: row.arvlMsg2,
        remainingSeconds: Number(row.barvlDt ?? 0),
    }));
}
export async function getSubwayDirectionOptions(
    stationName: string,
    lineName: string
): Promise<SubwayDirectionOption[]> {
    const trimmedStationName = stationName.trim().replace(/역$/, '');
    const normalizedLineName = normalizeLineName(lineName);

    if (!trimmedStationName || !normalizedLineName) {
        return [];
    }

    const directions: SubwayDirectionOption['direction'][] = [
        '상행',
        '하행',
        '내선',
        '외선',
    ];

    const allRows: any[] = [];

    for (const direction of directions) {
        const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/getTrainSch/1/100/%20/N/${encodeURIComponent(direction)}/%ED%8F%89%EC%9D%BC/${encodeURIComponent(normalizedLineName)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('지하철 방향 후보 조회에 실패했습니다.');
        }

        const data = await response.json();

        console.log(`${direction} 시간표 응답:`, data);

        const items = data.response?.body?.items?.item;

        if (Array.isArray(items)) {
            allRows.push(...items);
        } else if (items) {
            allRows.push(items);
        }
    }

    const stationRows = allRows.filter((row: any) => {
        return (
            row.stnNm === trimmedStationName &&
            normalizeLineName(row.lineNm) === normalizedLineName
        );
    });

    const optionMap = new Map<string, SubwayDirectionOption>();

    stationRows.forEach((row: any) => {
        const direction = normalizeDirection(row.upbdnbSe);
        const destination = row.arvlStnNm;

        if (!direction || !destination) {
            return;
        }

        const key = `${direction}-${destination}`;

        optionMap.set(key, {
            direction,
            destination,
            label: `${direction} · ${destination}행`,
        });
    });

    return Array.from(optionMap.values());
}
export async function getNextSubwaySchedule(
    stationName: string,
    lineName: string,
    direction: string,
    destination: string
): Promise<SubwaySchedule | null> {
    const trimmedStationName = stationName.trim().replace(/역$/, '');
    const normalizedLineName = normalizeLineName(lineName);

    if (!trimmedStationName || !normalizedLineName || !direction) {
        return null;
    }

    const ranges = [
        [1, 1000],
        [1001, 2000],
        [2001, 3000],
        [3001, 4000],
    ];

    const rows: any[] = [];

    for (const [start, end] of ranges) {
        const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/getTrainSch/${start}/${end}/%20/N/${encodeURIComponent(direction)}/%ED%8F%89%EC%9D%BC/${encodeURIComponent(normalizedLineName)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('지하철 시간표 조회에 실패했습니다.');
        }

        const data = await response.json();

        const items = data.response?.body?.items?.item;
        const pageRows = Array.isArray(items) ? items : items ? [items] : [];

        rows.push(...pageRows);
    }
    const now = new Date();
    const currentSeconds =
        now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();


    const matchedRows = rows
        .filter((row: any) => {
            return (
                row.stnNm === trimmedStationName &&
                normalizeLineName(row.lineNm) === normalizedLineName &&
                row.upbdnbSe === direction &&
                (!destination || row.arvlStnNm === destination)
            );
        })
        .map((row: any) => ({
            departureTime: row.trainDptreTm,
            destination: row.arvlStnNm,
        }))
        .filter((schedule: any) => {
            const scheduleSeconds = convertTimeToSeconds(schedule.departureTime);

            return scheduleSeconds >= currentSeconds;
        })
        .sort((a: any, b: any) => {
            return (
                convertTimeToSeconds(a.departureTime) -
                convertTimeToSeconds(b.departureTime)
            );
        });
    console.log('시간표 필터 결과:', matchedRows.slice(0, 5));
    const nextSchedule = matchedRows[0];

    if (!nextSchedule) {
        return null;
    }

    const displayTime = nextSchedule.departureTime.slice(0, 5);

    return {
        departureTime: nextSchedule.departureTime,
        destination: nextSchedule.destination,
        label: `${displayTime} · ${nextSchedule.destination}행`,
    };
}
function convertTimeToSeconds(time: string) {
    const [hours, minutes, seconds] = time.split(':').map(Number);

    return hours * 3600 + minutes * 60 + seconds;
}
function normalizeDirection(direction: string) {
    if (
        direction === '상행' ||
        direction === '하행' ||
        direction === '내선' ||
        direction === '외선'
    ) {
        return direction;
    }

    return null;
}
function normalizeLineName(lineName: string) {
    const lineNameMap: Record<string, string> = {
        '01호선': '1호선',
        '02호선': '2호선',
        '03호선': '3호선',
        '04호선': '4호선',
        '05호선': '5호선',
        '06호선': '6호선',
        '07호선': '7호선',
        '08호선': '8호선',
        '09호선': '9호선',
    };

    return lineNameMap[lineName] ?? lineName;
}
function getSubwayIdByLineName(lineName: string) {
    const subwayIdMap: Record<string, string> = {
        '1호선': '1001',
        '2호선': '1002',
        '3호선': '1003',
        '4호선': '1004',
        '5호선': '1005',
        '6호선': '1006',
        '7호선': '1007',
        '8호선': '1008',
        '9호선': '1009',
        '경의중앙선': '1063',
        '공항철도': '1065',
        '경춘선': '1067',
        '수인분당선': '1075',
        '신분당선': '1077',
        '우이신설선': '1092',
        '신림선': '1093',
        '용인경전철': '1071',
    };

    return subwayIdMap[lineName] ?? lineName;
}