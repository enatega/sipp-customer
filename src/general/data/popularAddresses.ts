export type PopularAddress = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

// Coastal towns SIPP serves first; surfaced as quick picks anywhere a
// customer is asked to choose a delivery address. Mirrors sipp-web's
// modules/account/data/popularCities.ts.
export const POPULAR_ADDRESSES: PopularAddress[] = [
  {
    name: 'Santa Teresa',
    address: 'Santa Teresa, Puntarenas, Costa Rica',
    latitude: 9.6459,
    longitude: -85.1638,
  },
  {
    name: 'Tamarindo',
    address: 'Tamarindo, Guanacaste, Costa Rica',
    latitude: 10.2993,
    longitude: -85.8371,
  },
];
