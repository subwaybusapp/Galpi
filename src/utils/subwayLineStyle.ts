export function getSubwayLineBadgeText(lineName?: string) {
  const badgeMap: Record<string, string> = {
    "1호선": "1",
    "2호선": "2",
    "3호선": "3",
    "4호선": "4",
    "5호선": "5",
    "6호선": "6",
    "7호선": "7",
    "8호선": "8",
    "9호선": "9",
    "신분당선": "신",
    "수인분당선": "수",
    "경의중앙선": "경",
    "공항철도": "공",
    "경춘선": "춘",
    "우이신설선": "우",
    "신림선": "림",
    "용인경전철": "용",
  };

  return badgeMap[lineName ?? ""] ?? "철";
}

export function getSubwayLineColor(lineName?: string) {
  const colorMap: Record<string, string> = {
    "1호선": "#0052A4",
    "2호선": "#00A84D",
    "3호선": "#EF7C1C",
    "4호선": "#00A5DE",
    "5호선": "#996CAC",
    "6호선": "#CD7C2F",
    "7호선": "#747F00",
    "8호선": "#E6186C",
    "9호선": "#BDB092",
    "신분당선": "#D4003B",
    "수인분당선": "#F5A200",
    "경의중앙선": "#77C4A3",
    "공항철도": "#0090D2",
    "경춘선": "#0C8E72",
    "우이신설선": "#B7C452",
    "신림선": "#6789CA",
    "용인경전철": "#56AD2D",
  };

  return colorMap[lineName ?? ""] ?? "#111827";
}