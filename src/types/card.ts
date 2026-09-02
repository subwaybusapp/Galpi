export type RouteStepType = 'subway' | 'bus';

export type SubwayDirection = '상행' | '하행' | '내선' | '외선';

export type RouteStep = {
  id: string;
  type: RouteStepType;
  name: string;
  detail: string;

  lineName?: string;
  subwayId?: string;
  stationName?: string;
  stationCode?: string;
  subwayDirection?: SubwayDirection;
  destinationStationName?: string;
  destinationStationCode?: string;

  busNumber?: string;
  busStopName?: string;
  busRouteId?: string;

  boardingStopName?: string;
  boardingStopId?: string;
  boardingStopArsId?: string;
  boardingStopOrder?: number;

  alightingStopName?: string;
  alightingStopId?: string;
  alightingStopArsId?: string;
  alightingStopOrder?: number;
};

export type MoveCard = {
  id: string;
  name: string;
  color: string;
  icon: string;
  useRoute: boolean;
  routeSteps: RouteStep[];
  isBookmarked: boolean;
};

