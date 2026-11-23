import type {
  ConfidenceLevel,
  FilterState,
  HotspotRecord,
  RegionPreset,
  SatelliteType,
} from '../types/hotspot';

export const DEFAULT_FILTERS: FilterState = {
  provinsi: 'ALL',
  kabKota: 'ALL',
  satelit: 'ALL',
  confidence: 'ALL',
  tanggal: 'ALL',
  hourSlot: null,
  search: '',
};

export const REGION_PRESETS: RegionPreset[] = [
  { id: 'all', label: 'Seluruh Nusantara', center: [-2.4, 118.5], zoom: 5 },
  { id: 'kaltim', label: 'Kalimantan Timur & IKN', center: [-0.2, 116.8], zoom: 7 },
  { id: 'merauke', label: 'Papua Selatan (Merauke)', center: [-7.9, 139.6], zoom: 8 },
  { id: 'sulawesi', label: 'Sulawesi Tengah & Tenggara', center: [-2.8, 121.8], zoom: 7 },
  { id: 'ntt', label: 'Bali & Nusa Tenggara', center: [-9.0, 121.0], zoom: 7 },
  { id: 'jawa', label: 'Jawa & Sumatera Selatan', center: [-5.3, 107.2], zoom: 6 },
];

export function filterHotspots(
  records: HotspotRecord[],
  filters: FilterState
): HotspotRecord[] {
  const q = filters.search.trim().toLowerCase();

  return records.filter((r) => {
    if (filters.provinsi !== 'ALL' && r.provinsi !== filters.provinsi) return false;
    if (filters.kabKota !== 'ALL' && r.kabKota !== filters.kabKota) return false;
    if (filters.satelit !== 'ALL' && r.satelit !== filters.satelit) return false;
    if (filters.confidence !== 'ALL' && r.confidence !== filters.confidence) return false;
    if (filters.tanggal !== 'ALL' && r.tanggal !== filters.tanggal) return false;
    if (filters.hourSlot) {
      const slot = `${r.tanggal}|${r.waktu.slice(0, 2)}`;
      if (slot !== filters.hourSlot) return false;
    }
    if (q) {
      const hay = `${r.provinsi} ${r.kabKota} ${r.kecamatan} ${r.desa} ${r.lat} ${r.lng}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export interface ProvinceStat {
  provinsi: string;
  total: number;
  high: number;
  medium: number;
  low: number;
  kabCount: number;
}

export function aggregateByProvince(records: HotspotRecord[]): ProvinceStat[] {
  const map = new Map<
    string,
    { total: number; high: number; medium: number; low: number; kabs: Set<string> }
  >();

  for (const r of records) {
    let entry = map.get(r.provinsi);
    if (!entry) {
      entry = { total: 0, high: 0, medium: 0, low: 0, kabs: new Set() };
      map.set(r.provinsi, entry);
    }
    entry.total += 1;
    if (r.confidence === 'High') entry.high += 1;
    else if (r.confidence === 'Medium') entry.medium += 1;
    else entry.low += 1;
    entry.kabs.add(r.kabKota);
  }

  return Array.from(map.entries())
    .map(([provinsi, v]) => ({
      provinsi,
      total: v.total,
      high: v.high,
      medium: v.medium,
      low: v.low,
      kabCount: v.kabs.size,
    }))
    .sort((a, b) => b.total - a.total || b.high - a.high);
}

export interface KabKotaStat {
  provinsi: string;
  kabKota: string;
  total: number;
  high: number;
  medium: number;
  low: number;
  kecCount: number;
  desaCount: number;
}

export function aggregateByKabKota(records: HotspotRecord[]): KabKotaStat[] {
  const map = new Map<
    string,
    {
      provinsi: string;
      kabKota: string;
      total: number;
      high: number;
      medium: number;
      low: number;
      kecs: Set<string>;
      desas: Set<string>;
    }
  >();

  for (const r of records) {
    const key = `${r.provinsi}__${r.kabKota}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        provinsi: r.provinsi,
        kabKota: r.kabKota,
        total: 0,
        high: 0,
        medium: 0,
        low: 0,
        kecs: new Set(),
        desas: new Set(),
      };
      map.set(key, entry);
    }
    entry.total += 1;
    if (r.confidence === 'High') entry.high += 1;
    else if (r.confidence === 'Medium') entry.medium += 1;
    else entry.low += 1;
    entry.kecs.add(r.kecamatan);
    entry.desas.add(r.desa);
  }

  return Array.from(map.values())
    .map((v) => ({
      provinsi: v.provinsi,
      kabKota: v.kabKota,
      total: v.total,
      high: v.high,
      medium: v.medium,
      low: v.low,
      kecCount: v.kecs.size,
      desaCount: v.desas.size,
    }))
    .sort((a, b) => b.total - a.total || b.high - a.high);
}

export interface DesaClusterStat {
  provinsi: string;
  kabKota: string;
  kecamatan: string;
  desa: string;
  total: number;
  high: number;
  medium: number;
  low: number;
  centerLat: number;
  centerLng: number;
}

export function aggregateByDesa(records: HotspotRecord[]): DesaClusterStat[] {
  const map = new Map<
    string,
    {
      provinsi: string;
      kabKota: string;
      kecamatan: string;
      desa: string;
      total: number;
      high: number;
      medium: number;
      low: number;
      sumLat: number;
      sumLng: number;
    }
  >();

  for (const r of records) {
    const key = `${r.provinsi}__${r.kabKota}__${r.kecamatan}__${r.desa}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        provinsi: r.provinsi,
        kabKota: r.kabKota,
        kecamatan: r.kecamatan,
        desa: r.desa,
        total: 0,
        high: 0,
        medium: 0,
        low: 0,
        sumLat: 0,
        sumLng: 0,
      };
      map.set(key, entry);
    }
    entry.total += 1;
    if (r.confidence === 'High') entry.high += 1;
    else if (r.confidence === 'Medium') entry.medium += 1;
    else entry.low += 1;
    entry.sumLat += r.lat;
    entry.sumLng += r.lng;
  }

  return Array.from(map.values())
    .map((v) => ({
      provinsi: v.provinsi,
      kabKota: v.kabKota,
      kecamatan: v.kecamatan,
      desa: v.desa,
      total: v.total,
      high: v.high,
      medium: v.medium,
      low: v.low,
      centerLat: v.sumLat / v.total,
      centerLng: v.sumLng / v.total,
    }))
    .sort((a, b) => b.total - a.total || b.high - a.high);
}

export interface HourlyBucket {
  slot: string; // "17-11-2026|18"
  dateLabel: string; // "17 Nov"
  hourLabel: string; // "18:00"
  total: number;
  noaa21: number;
  noaa20: number;
  modis: number;
  high: number;
}

export function aggregateByHour(records: HotspotRecord[]): HourlyBucket[] {
  const map = new Map<string, HourlyBucket>();

  for (const r of records) {
    const hh = r.waktu.slice(0, 2);
    const slot = `${r.tanggal}|${hh}`;
    let bucket = map.get(slot);
    if (!bucket) {
      const day = r.tanggal.slice(0, 2);
      bucket = {
        slot,
        dateLabel: `${day} Nov`,
        hourLabel: `${hh}:00`,
        total: 0,
        noaa21: 0,
        noaa20: 0,
        modis: 0,
        high: 0,
      };
      map.set(slot, bucket);
    }
    bucket.total += 1;
    if (r.satelit === 'NASA-NOAA21') bucket.noaa21 += 1;
    else if (r.satelit === 'NASA-NOAA20') bucket.noaa20 += 1;
    else bucket.modis += 1;
    if (r.confidence === 'High') bucket.high += 1;
  }

  return Array.from(map.values()).sort((a, b) => a.slot.localeCompare(b.slot));
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyHotspots(
  target: HotspotRecord,
  all: HotspotRecord[],
  radiusKm = 15
): Array<{ record: HotspotRecord; distanceKm: number }> {
  return all
    .filter((r) => r.id !== target.id)
    .map((r) => ({ record: r, distanceKm: haversineKm(target.lat, target.lng, r.lat, r.lng) }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getConfidenceColor(conf: ConfidenceLevel): string {
  if (conf === 'High') return '#DC2626';
  if (conf === 'Medium') return '#EA580C';
  return '#0284C7';
}

export function getConfidenceLabelID(conf: ConfidenceLevel): string {
  if (conf === 'High') return 'Tinggi (High)';
  if (conf === 'Medium') return 'Sedang (Medium)';
  return 'Rendah (Low)';
}

export function getSatelliteColor(sat: SatelliteType): string {
  if (sat === 'NASA-NOAA21') return '#EA580C';
  if (sat === 'NASA-NOAA20') return '#0284C7';
  return '#7C3AED';
}

export function exportHotspotsToCSV(records: HotspotRecord[], filename = 'data-karhutla-hotspot.csv') {
  const headers = [
    'ID',
    'Provinsi',
    'Kabupaten/Kota',
    'Kecamatan',
    'Desa',
    'Tanggal',
    'Waktu',
    'Satelit',
    'Confidence',
    'Latitude',
    'Longitude',
  ];

  const escapeCsv = (val: string | number) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = records.map((r) =>
    [
      r.id,
      r.provinsi,
      r.kabKota,
      r.kecamatan,
      r.desa,
      r.tanggal,
      r.waktu,
      r.satelit,
      r.confidence,
      r.lat,
      r.lng,
    ]
      .map(escapeCsv)
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
