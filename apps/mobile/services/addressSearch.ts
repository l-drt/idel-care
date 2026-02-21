/**
 * Recherche d'adresses via l'API adresse.data.gouv.fr (Base Adresse Nationale).
 * Aucune clé API requise.
 */

const SEARCH_URL = 'https://api-adresse.data.gouv.fr/search/';

export interface AddressSuggestion {
  label: string;
  address: string;
  city: string;
  postalCode: string;
  /** Latitude (WGS84), pour future carte / visualisation. */
  latitude?: number | null;
  /** Longitude (WGS84), pour future carte / visualisation. */
  longitude?: number | null;
}

interface FeatureProperties {
  label?: string;
  name?: string;
  postcode?: string;
  city?: string;
  street?: string;
  housenumber?: string;
}

interface Feature {
  properties?: FeatureProperties;
  /** GeoJSON: coordinates[0] = longitude, coordinates[1] = latitude */
  geometry?: { coordinates?: [number, number] };
}

interface SearchResponse {
  features?: Feature[];
}

export async function searchAddress(query: string, limit = 8): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as SearchResponse;
  const features = data.features ?? [];

  return features
    .filter((f) => f.properties?.label)
    .map((f) => {
      const [lon, lat] = f.geometry?.coordinates ?? [];
      return {
        label: f.properties!.label!,
        address: f.properties!.label!,
        city: f.properties!.city ?? '',
        postalCode: f.properties!.postcode ?? '',
        latitude: lat ?? null,
        longitude: lon ?? null,
      };
    });
}
