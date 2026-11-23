export type SatelliteType = 'NASA-NOAA21' | 'NASA-NOAA20' | 'NASA-MODIS';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type DashboardView = 'overview' | 'regional' | 'table' | 'source' | 'luas';

export interface HotspotRecord {
  id: number;
  provinsi: string;
  kabKota: string;
  kecamatan: string;
  desa: string;
  tanggal: string;
  waktu: string;
  satelit: SatelliteType;
  confidence: ConfidenceLevel;
  lat: number;
  lng: number;
}

export interface SummaryRecord {
  id: number;
  provinsi: string;
  kabKota: string;
  satelit: SatelliteType;
  confidence: ConfidenceLevel;
  counter: number;
}

export interface FilterState {
  provinsi: string;
  kabKota: string;
  satelit: 'ALL' | SatelliteType;
  confidence: 'ALL' | ConfidenceLevel;
  tanggal: 'ALL' | string;
  hourSlot: string | null; // e.g. "18-11-2026|00"
  search: string;
}

export interface RegionPreset {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
  provinsiFilter?: string;
}
