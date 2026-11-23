import { useMemo } from 'react';
import { ArrowUpRight, Flame, ShieldAlert } from 'lucide-react';
import type { ConfidenceLevel, HotspotRecord, SatelliteType } from '../types/hotspot';
import {
  aggregateByDesa,
  aggregateByKabKota,
  getConfidenceLabelID,
} from '../utils/analytics';

interface RegionalAnalysisViewProps {
  records: HotspotRecord[];
  allRecords: HotspotRecord[];
  onFocusKabKota: (provinsi: string, kabKota: string) => void;
  onSelectHotspot: (record: HotspotRecord) => void;
  onFilterHighConfidence: () => void;
}

const SATELLITES: SatelliteType[] = ['NASA-NOAA21', 'NASA-NOAA20', 'NASA-MODIS'];
const CONFIDENCES: ConfidenceLevel[] = ['High', 'Medium', 'Low'];

export function RegionalAnalysisView({
  records,
  allRecords,
  onFocusKabKota,
  onSelectHotspot,
  onFilterHighConfidence,
}: RegionalAnalysisViewProps) {
  const kabStats = useMemo(() => aggregateByKabKota(records).slice(0, 15), [records]);
  const desaStats = useMemo(() => aggregateByDesa(records).slice(0, 15), [records]);

  const maxKabTotal = useMemo(
    () => Math.max(1, ...kabStats.map((k) => k.total)),
    [kabStats]
  );

  // Satellite x Confidence cross-tabulation matrix
  const matrix = useMemo(() => {
    const table: Record<SatelliteType, Record<ConfidenceLevel, number>> = {
      'NASA-NOAA21': { High: 0, Medium: 0, Low: 0 },
      'NASA-NOAA20': { High: 0, Medium: 0, Low: 0 },
      'NASA-MODIS': { High: 0, Medium: 0, Low: 0 },
    };
    for (const r of records) {
      table[r.satelit][r.confidence] += 1;
    }
    return table;
  }, [records]);

  // Critical High-confidence hotspots & IKN zone hotspots
  const highPriorityHotspots = useMemo(
    () => records.filter((r) => r.confidence === 'High').slice(0, 10),
    [records]
  );

  const iknHotspots = useMemo(
    () => allRecords.filter((r) => r.provinsi === 'IKN'),
    [allRecords]
  );

  return (
    <div className="space-y-6">
      {/* Top Row: Kab/Kota Leaderboard & Desa Cluster Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Top 15 Kabupaten/Kota */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                15 Kabupaten / Kota Terpadat
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Klik baris wilayah untuk memfokuskan peta & tabel
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {aggregateByKabKota(records).length} Kab/Kota aktif
            </span>
          </div>

          {kabStats.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
              Tidak ada wilayah untuk filter aktif.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
              {kabStats.map((item, idx) => (
                <button
                  key={`${item.provinsi}-${item.kabKota}`}
                  type="button"
                  onClick={() => onFocusKabKota(item.provinsi, item.kabKota)}
                  className="w-full px-5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="w-5 text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.kabKota}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.provinsi} · {item.kecCount} Kec · {item.desaCount} Desa
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-orange-600"
                        style={{ width: `${(item.total / maxKabTotal) * 100}%` }}
                      />
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.total}
                      </span>
                      {item.high > 0 && (
                        <span className="ml-1.5 text-[11px] text-red-600 dark:text-red-400">
                          ({item.high} H)
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Top 15 Klaster Desa / Kelurahan */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                15 Klaster Desa / Kelurahan Terpadat
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Titik konsentrasi mikro tingkat desa untuk prioritas patroli darat
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {aggregateByDesa(records).length} Desa aktif
            </span>
          </div>

          {desaStats.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
              Tidak ada desa untuk filter aktif.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
              {desaStats.map((item, idx) => {
                const sample = records.find(
                  (r) =>
                    r.provinsi === item.provinsi &&
                    r.kabKota === item.kabKota &&
                    r.kecamatan === item.kecamatan &&
                    r.desa === item.desa
                );
                return (
                  <button
                    key={`${item.kabKota}-${item.kecamatan}-${item.desa}`}
                    type="button"
                    onClick={() => sample && onSelectHotspot(sample)}
                    className="w-full px-5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="w-5 text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {item.desa}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Kec. {item.kecamatan}, {item.kabKota}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                      <span className="hidden md:inline text-[11px] text-slate-400 dark:text-slate-500">
                        {item.centerLat.toFixed(2)}, {item.centerLng.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.total}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Row: Satellite Matrix + Critical High-Confidence & IKN Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Matrix: Satellite vs Confidence */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Matriks Satelit × Tingkat Kepercayaan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
            Distribusi silang sensor NASA terhadap tingkat kepercayaan deteksi
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 text-left font-medium">Satelit</th>
                  <th className="py-2.5 text-right font-medium text-red-600 dark:text-red-400">
                    High
                  </th>
                  <th className="py-2.5 text-right font-medium text-orange-600 dark:text-orange-400">
                    Medium
                  </th>
                  <th className="py-2.5 text-right font-medium text-sky-600 dark:text-sky-400">
                    Low
                  </th>
                  <th className="py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                {SATELLITES.map((sat) => {
                  const row = matrix[sat];
                  const rowTotal = row.High + row.Medium + row.Low;
                  return (
                    <tr key={sat} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                        {sat}
                      </td>
                      <td className="py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                        {row.High}
                      </td>
                      <td className="py-3 text-right text-slate-700 dark:text-slate-300">
                        {row.Medium}
                      </td>
                      <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                        {row.Low}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 font-semibold bg-slate-50/70 dark:bg-slate-800/40">
                  <td className="py-3 font-sans text-slate-900 dark:text-slate-100">
                    Total Aktif
                  </td>
                  {CONFIDENCES.map((conf) => {
                    const colSum = SATELLITES.reduce((acc, sat) => acc + matrix[sat][conf], 0);
                    return (
                      <td key={conf} className="py-3 text-right text-slate-900 dark:text-slate-100">
                        {colSum}
                      </td>
                    );
                  })}
                  <td className="py-3 text-right text-orange-600 dark:text-orange-400">
                    {records.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* IKN Zone Callout */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Pantauan Zona Khusus IKN (Ibu Kota Nusantara)
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {iknHotspots.length} deteksi
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {iknHotspots.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectHotspot(r)}
                  className="w-full py-2 text-left flex items-center justify-between gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded transition-colors cursor-pointer"
                >
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {r.desa} ({r.kecamatan}, {r.kabKota})
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                    {r.satelit} · {r.waktu}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Critical High-Confidence Hotspots Triage */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Prioritas Penanganan: Titik Kepercayaan Tinggi (High)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Menampilkan hingga 10 titik dengan indikasi kebakaran aktif paling kuat
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onFilterHighConfidence}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              Saring Semua Titik High
            </button>
          </div>

          {highPriorityHotspots.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Tidak ada titik berstatus High pada filter saat ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 text-left font-medium">Desa / Kecamatan</th>
                    <th className="py-2 text-left font-medium">Kabupaten / Provinsi</th>
                    <th className="py-2 text-left font-medium">Satelit</th>
                    <th className="py-2 text-right font-medium">Waktu</th>
                    <th className="py-2 text-right font-medium">Koordinat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {highPriorityHotspots.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => onSelectHotspot(r)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {r.desa}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Kec. {r.kecamatan}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="text-slate-800 dark:text-slate-200">{r.kabKota}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {r.provinsi}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-slate-700 dark:text-slate-300">
                        {r.satelit}
                        <div className="text-[11px] text-red-600 dark:text-red-400 font-sans">
                          {getConfidenceLabelID(r.confidence)}
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {r.tanggal}
                        <div className="text-[11px] text-slate-500">{r.waktu}</div>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
