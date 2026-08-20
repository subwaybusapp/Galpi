export type RouteStepType = 'subway' | 'bus' | 'walk';

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

  busNumber?: string;
  busStopName?: string;
};

export type MoveCard = {
  id: string;
  name: string;
  color: string;
  icon: string;
  useRoute: boolean;
  routeSteps: RouteStep[];
};