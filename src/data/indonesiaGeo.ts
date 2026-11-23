import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import countries50m from 'world-atlas/countries-50m.json';

// Regional IDs around Indonesia (ISO 3166-1 numeric):
// 360: Indonesia, 458: Malaysia, 096: Brunei, 626: Timor-Leste, 598: Papua New Guinea, 702: Singapore, 036: Australia, 608: Philippines
const REGIONAL_IDS = new Set(['360', '458', '096', '626', '598', '702', '036', '608']);

let cachedFeatures: GeoJSON.FeatureCollection | null = null;

export function getIndonesiaRegionGeoJSON(): GeoJSON.FeatureCollection {
  if (cachedFeatures) return cachedFeatures;

  const topo = countries50m as unknown as Topology<{
    countries: GeometryCollection<{ name?: string }>;
  }>;

  const geo = feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection;
  const regional = geo.features.filter((f) => {
    const id = String(f.id ?? '').padStart(3, '0');
    return REGIONAL_IDS.has(id) || f.properties?.name === 'Indonesia';
  });

  cachedFeatures = {
    type: 'FeatureCollection',
    features: regional,
  };
  return cachedFeatures;
}
