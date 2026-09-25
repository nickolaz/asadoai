export type MapLocationKind = 'butcher' | 'price-source';

export type MapLocation = {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  kind: MapLocationKind;
  distanceKm?: number;
};
