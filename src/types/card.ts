export type RouteStepType = 'subway' | 'bus' | 'walk';

export type RouteStep = {
  id: string;
  type: RouteStepType;
  name: string;
  detail: string;
  minutes?: number;

  lineName?: string;
  stationName?: string;
  direction?: string;
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