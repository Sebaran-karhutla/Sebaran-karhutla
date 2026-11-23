import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { HotspotRecord } from '../types/hotspot';
import {
  exportHotspotsToCSV,
  getConfidenceColor,
  getConfidenceLabelID,
} from '../utils/analytics';

interface HotspotTableViewProps {
  records: HotspotRecord[];
  selectedHotspotId: number | null;
  onSelectHotspot: (record: HotspotRecord) => void;
}

type SortKey = 'id' | 'provinsi' | 'kabKota' | 'desa' | 'tanggal' | 'satelit' | 'confidence';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

export function HotspotTableView({
  records,
  selectedHotspotId,
  onSelectHotspot,
}: HotspotTableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...records];
    const confRank = { High: 3, Medium: 2, Low: 1 };
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'id') {
        cmp = a.id - b.id;
      } else if (sortKey === 'confidence') {
        cmp = confRank[a.confidence] - confRank[b.confidence];
      } else if (sortKey === 'tanggal') {
        cmp = `${a.tanggal} ${a.waktu}`.localeCompare(`${b.tanggal} ${b.waktu}`);
      } else {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [records, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, safePage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'confidence' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-orange-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-orange-600" />
    );
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Log Lengkap Titik Panas (Data Deteksi Satelit)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Menampilkan <span className="font-mono tabular-nums font-medium">{sorted.length.toLocaleString('id-ID')}</span> rekaman · Klik baris mana saja untuk melihat radius 15 km dan detail koordinat
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportHotspotsToCSV(sorted)}
          disabled={sorted.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Unduh CSV ({sorted.length})
        </button>
      </div>

      {/* High-Density Data Grid */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
          Tidak ada rekaman yang sesuai dengan filter atau pencarian Anda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('id')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    No <SortIcon col="id" />
                  </button>
                </th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('provinsi')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    Provinsi <SortIcon col="provinsi" />
                  </button>
                </th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('kabKota')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    Kab / Kota <SortIcon col="kabKota" />
                  </button>
                </th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('desa')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    Kecamatan / Desa <SortIcon col="desa" />
                  </button>
                </th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('satelit')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    Satelit <SortIcon col="satelit" />
                  </button>
                </th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('confidence')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    Kepercayaan <SortIcon col="confidence" />
                  </button>
                </th>
                <th className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('tanggal')}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    Waktu (WIB) <SortIcon col="tanggal" />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">
                  Latitude, Longitude
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {pageRows.map((r) => {
                const isSelected = selectedHotspotId === r.id;
                const color = getConfidenceColor(r.confidence);
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectHotspot(r)}
                    className={`h-10 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-orange-50/80 dark:bg-orange-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-4 py-2 font-mono tabular-nums text-slate-400 dark:text-slate-500">
                      {r.id}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {r.provinsi}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.kabKota}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {r.desa}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500"> · {r.kecamatan}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.satelit}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-medium" style={{ color }}>
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: color }}
                          aria-hidden="true"
                        />
                        {getConfidenceLabelID(r.confidence)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {r.tanggal} · {r.waktu}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="font-mono tabular-nums">
          Halaman {safePage} dari {totalPages} · Menampilkan {(safePage - 1) * PAGE_SIZE + (pageRows.length > 0 ? 1 : 0)}–{(safePage - 1) * PAGE_SIZE + pageRows.length} dari {sorted.length}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Sebelumnya
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            Berikutnya
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
