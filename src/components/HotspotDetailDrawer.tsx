import { useMemo } from 'react';
import { Crosshair, MapPin, Navigation, Satellite, X } from 'lucide-react';
import type { HotspotRecord } from '../types/hotspot';
import { getConfidenceColor, getConfidenceLabelID, getNearbyHotspots } from '../utils/analytics';

interface HotspotDetailDrawerProps {
  hotspot: HotspotRecord | null;
  allRecords: HotspotRecord[];
  onClose: () => void;
  onSelectHotspot: (record: HotspotRecord) => void;
  onFocusKabKota: (provinsi: string, kabKota: string) => void;
}

export function HotspotDetailDrawer({
  hotspot,
  allRecords,
  onClose,
  onSelectHotspot,
  onFocusKabKota,
}: HotspotDetailDrawerProps) {
  const nearby = useMemo(() => {
    if (!hotspot) return [];
    return getNearbyHotspots(hotspot, allRecords, 15).slice(0, 12);
  }, [hotspot, allRecords]);

  if (!hotspot) return null;

  const confColor = getConfidenceColor(hotspot.confidence);

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
      role="dialog"
      aria-label="Detail Titik Panas"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Rekaman Titik Panas #{hotspot.id}
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {hotspot.desa}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Tutup panel detail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Status Summary Strip */}
        <div className="grid grid-cols-2 gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tingkat Kepercayaan</div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: confColor }}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {getConfidenceLabelID(hotspot.confidence)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Sensor Satelit</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium font-mono text-slate-900 dark:text-slate-100">
              <Satellite className="w-3.5 h-3.5 text-slate-400" />
              {hotspot.satelit}
            </div>
          </div>
        </div>

        {/* Administrative Hierarchy */}
        <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Lokasi Administratif
          </div>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Provinsi</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {hotspot.provinsi}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Kabupaten / Kota</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {hotspot.kabKota}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Kecamatan</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {hotspot.kecamatan}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Desa / Kelurahan</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {hotspot.desa}
              </dd>
            </div>
          </dl>
        </div>

        {/* Coordinates & Timestamp */}
        <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Koordinat & Waktu Akuisisi
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Crosshair className="w-3 h-3" /> Latitude / Longitude
              </div>
              <div className="font-mono tabular-nums text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {hotspot.lat.toFixed(5)}, {hotspot.lng.toFixed(5)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Navigation className="w-3 h-3" /> Tanggal & Jam
              </div>
              <div className="font-mono tabular-nums text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {hotspot.tanggal} · {hotspot.waktu}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFocusKabKota(hotspot.provinsi, hotspot.kabKota)}
            className="w-full py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Filter Seluruh Dashboard ke {hotspot.kabKota}
          </button>
        </div>

        {/* Nearby Hotspots within 15 km */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Titik Panas Terdekat (Radius 15 km)
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {nearby.length} titik
            </span>
          </div>

          {nearby.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
              Titik terisolasi — tidak ditemukan titik panas lain dalam radius 15 km.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
              {nearby.map(({ record, distanceKm }) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => onSelectHotspot(record)}
                  className="w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {record.desa}, {record.kecamatan}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                      {record.satelit} · {record.confidence} · {record.waktu}
                    </div>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-semibold text-orange-600 dark:text-orange-400 shrink-0">
                    {distanceKm.toFixed(1)} km
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
