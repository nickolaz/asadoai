import type { MapLocation } from './map-locations';

/** Runtime counterpart of locations.json for client components. */
export const savedLocations: MapLocation[] = [
  { id: 'res-scalabrini', name: 'RES Carnicerías', address: 'Av. Scalabrini Ortiz 2366, Palermo', coordinates: [-58.4148, -34.5874], kind: 'butcher' },
  { id: 'res-gorriti', name: 'RES Carnicerías', address: 'Gorriti 6001, Palermo', coordinates: [-58.4353, -34.5817], kind: 'butcher' },
  { id: 'res-corrientes', name: 'RES Carnicerías', address: 'Av. Corrientes 5185, Villa Crespo', coordinates: [-58.4424, -34.5973], kind: 'butcher' },
  { id: 'res-triunvirato', name: 'RES Carnicerías', address: 'Av. Triunvirato 3805, Villa Urquiza', coordinates: [-58.4811, -34.5728], kind: 'butcher' },
  { id: 'res-maria-del-carril', name: 'RES Carnicerías', address: 'María del Carril 2893, Villa Pueyrredón', coordinates: [-58.4952, -34.5814], kind: 'butcher' },
  { id: 'coto-honduras', name: 'Coto', address: 'Honduras 3862, Palermo', coordinates: [-58.4212, -34.5873], kind: 'price-source' },
  { id: 'coto-diaz-velez', name: 'Coto', address: 'Av. Díaz Vélez 4531, Almagro', coordinates: [-58.4272, -34.6035], kind: 'price-source' },
  { id: 'coto-mexico', name: 'Coto', address: 'México 2236, Balvanera', coordinates: [-58.4017, -34.6151], kind: 'price-source' },
  { id: 'disco-santa-fe', name: 'Disco', address: 'Av. Santa Fe 3250, Palermo', coordinates: [-58.4164, -34.5935], kind: 'price-source' },
  { id: 'disco-cordoba', name: 'Disco', address: 'Av. Córdoba 5501, Palermo', coordinates: [-58.4364, -34.5839], kind: 'price-source' },
];
