import { useMemo, useState } from 'react';
import type { HotspotRecord, SatelliteType } from '../types/hotspot';
import { aggregateByHour, aggregateByProvince } from '../utils/analytics';

interface ChartsPanelProps {
  records: HotspotRecord[];
  allRecords: HotspotRecord[];
  selectedProvinsi: string;
  selectedHourSlot: string | null;
  onSelectProvinsi: (provinsi: string) => void;
  onSelectHourSlot: (slot: string | null) => void;
}

export function ChartsPanel({
  records,
  allRecords,
  selectedProvinsi,
  selectedHourSlot,
  onSelectProvinsi,
  onSelectHourSlot,
}: ChartsPanelProps) {
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);

  // Use allRecords scoped by non-province filters or current records?
  // Using allRecords when a province is selected lets user still compare & click other provinces easily,
  // while showing filtered counts if other filters (like Satelit/Confidence) are active!
  const provinceStats = useMemo(() => {
    return aggregateByProvince(records).slice(0, 10);
  }, [records]);

  const maxProvinceTotal = useMemo(() => {
    return Math.max(1, ...provinceStats.map((p) => p.total));
  }, [provinceStats]);

  // For timeline, show all buckets from records (or fallback to allRecords structure if filtered to 1 hour)
  const hourlyBuckets = useMemo(() => {
    const source = selectedHourSlot ? allRecords : records;
    return aggregateByHour(source);
  }, [records, allRecords, selectedHourSlot]);

  const maxHourlyTotal = useMemo(() => {
    return Math.max(1, ...hourlyBuckets.map((b) => b.total));
  }, [hourlyBuckets]);

  const activeHoverBucket = useMemo(
    () => hourlyBuckets.find((b) => b.slot === hoveredHour) ?? null,
    [hourlyBuckets, hoveredHour]
  );

  // Satellite breakdown on current filtered records
  const satTotals = useMemo(() => {
    const counts: Record<SatelliteType, number> = {
      'NASA-NOAA21': 0,
      'NASA-NOAA20': 0,
      'NASA-MODIS': 0,
    };
    for (const r of records) {
      counts[r.satelit] += 1;
    }
    return counts;
  }, [records]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Left: Top 10 Provinsi Stacked Bar Breakdown */}
      <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                10 Provinsi dengan Sebaran Tertinggi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Klik baris provinsi untuk memfilter seluruh dashboard
              </p>
            </div>
            {selectedProvinsi !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectProvinsi('ALL')}
                className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Tampilkan Semua
              </button>
            )}
          </div>

          {provinceStats.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Tidak ada data provinsi untuk filter aktif.
            </div>
          ) : (
            <div className="space-y-2.5">
              {provinceStats.map((item) => {
                const isSelected = selectedProvinsi === item.provinsi;
                const widthPct = (item.total / maxProvinceTotal) * 100;
                const highPct = (item.high / item.total) * 100;
                const medPct = (item.medium / item.total) * 100;
                const lowPct = (item.low / item.total) * 100;

                return (
                  <button
                    key={item.provinsi}
                    type="button"
                    onClick={() =>
                      onSelectProvinsi(isSelected ? 'ALL' : item.provinsi)
                    }
                    className={`w-full text-left group rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-orange-950/30 ring-1 ring-orange-500/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.provinsi}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                        {item.high > 0 && (
                          <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                            {item.high} High
                          </span>
                        )}
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">
                          {item.total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full flex transition-all duration-300"
                        style={{ width: `${Math.max(widthPct, 2)}%` }}
                      >
                        {item.high > 0 && (
                          <div
                            className="h-full bg-red-600"
                            style={{ width: `${highPct}%` }}
                          />
                        )}
                        {item.medium > 0 && (
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${medPct}%` }}
                          />
                        )}
                        {item.low > 0 && (
                          <div
                            className="h-full bg-sky-600"
                            style={{ width: `${lowPct}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Proporsi segmen: Merah (High) · Jingga (Medium) · Biru (Low)</span>
          <span className="font-mono tabular-nums">
            Total {records.length.toLocaleString('id-ID')} titik
          </span>
        </div>
      </section>

      {/* Right: Hourly Satellite Overpass Timeline */}
      <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Linimasa Deteksi per Jam (17–18 Nov 2026)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lintasan satelit WIB · Klik batang jam untuk menyaring waktu deteksi
              </p>
            </div>
            {selectedHourSlot && (
              <button
                type="button"
                onClick={() => onSelectHourSlot(null)}
                className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Reset Jam
              </button>
            )}
          </div>

          {/* Interactive Tooltip Readout Bar */}
          <div className="mb-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs min-h-[36px]">
            {activeHoverBucket ? (
              <>
                <span className="font-medium text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                  {activeHoverBucket.dateLabel} · {activeHoverBucket.hourLabel} WIB
                </span>
                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  Total {activeHoverBucket.total} · NOAA21: {activeHoverBucket.noaa21} · NOAA20: {activeHoverBucket.noaa20} · MODIS: {activeHoverBucket.modis}
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-500 dark:text-slate-400">
                  Komposisi Satelit Aktif:
                </span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">
                  NOAA21: {satTotals['NASA-NOAA21']} · NOAA20: {satTotals['NASA-NOAA20']} · MODIS: {satTotals['NASA-MODIS']}
                </span>
              </>
            )}
          </div>

          {/* Responsive Bar Chart */}
          {hourlyBuckets.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
              Tidak ada data waktu deteksi untuk filter aktif.
            </div>
          ) : (
            <div className="h-[225px] flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
              {hourlyBuckets.map((bucket) => {
                const heightPct = (bucket.total / maxHourlyTotal) * 100;
                const noaa21H = (bucket.noaa21 / bucket.total) * 100;
                const noaa20H = (bucket.noaa20 / bucket.total) * 100;
                const modisH = (bucket.modis / bucket.total) * 100;
                const isSelected = selectedHourSlot === bucket.slot;
                const isDimmed = selectedHourSlot !== null && !isSelected;

                return (
                  <button
                    key={bucket.slot}
                    type="button"
                    onMouseEnter={() => setHoveredHour(bucket.slot)}
                    onMouseLeave={() => setHoveredHour(null)}
                    onClick={() =>
                      onSelectHourSlot(isSelected ? null : bucket.slot)
                    }
                    className={`flex-1 h-full flex flex-col justify-end items-center group cursor-pointer transition-opacity ${
                      isDimmed ? 'opacity-35 hover:opacity-80' : 'opacity-100'
                    }`}
                  >
                    <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bucket.total}
                    </span>
                    <div
                      className={`w-full max-w-[30px] rounded-t-sm overflow-hidden flex flex-col-reverse transition-all ${
                        isSelected
                          ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-1 dark:ring-offset-slate-900'
                          : ''
                      }`}
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    >
                      {bucket.noaa21 > 0 && (
                        <div
                          className="w-full bg-orange-600"
                          style={{ height: `${noaa21H}%` }}
                        />
                      )}
                      {bucket.noaa20 > 0 && (
                        <div
                          className="w-full bg-sky-600"
                          style={{ height: `${noaa20H}%` }}
                        />
                      )}
                      {bucket.modis > 0 && (
                        <div
                          className="w-full bg-violet-600"
                          style={{ height: `${modisH}%` }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* X-axis Labels */}
          {hourlyBuckets.length > 0 && (
            <div className="flex items-start gap-1.5 mt-2">
              {hourlyBuckets.map((bucket) => (
                <div
                  key={bucket.slot}
                  className="flex-1 text-center font-mono tabular-nums leading-tight"
                >
                  <div className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                    {bucket.hourLabel.slice(0, 2)}
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500">
                    {bucket.dateLabel.slice(0, 2)}/11
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Satellite Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-600 inline-block" aria-hidden="true" />
              NASA-NOAA21
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-600 inline-block" aria-hidden="true" />
              NASA-NOAA20
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-violet-600 inline-block" aria-hidden="true" />
              NASA-MODIS
            </span>
          </div>
          <span className="font-mono tabular-nums text-slate-500">WIB (UTC+7)</span>
        </div>
      </section>
    </div>
  );
}
