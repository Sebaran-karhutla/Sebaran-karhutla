import { useMemo, useState } from 'react';
import { ExternalLink, FileText, Search } from 'lucide-react';
import type { SummaryRecord } from '../types/hotspot';
import { getConfidenceColor, getConfidenceLabelID } from '../utils/analytics';

interface SourceDocumentViewProps {
  summaryRecords: SummaryRecord[];
  onFocusKabKota: (provinsi: string, kabKota: string) => void;
}

const PDF_PATH = `${import.meta.env.BASE_URL}assets/aistudio/sebaran-hotspot_801db754.pdf`;

export function SourceDocumentView({
  summaryRecords,
  onFocusKabKota,
}: SourceDocumentViewProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'summary' | 'pdf'>('summary');

  const filteredSummary = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return summaryRecords;
    return summaryRecords.filter((s) =>
      `${s.provinsi} ${s.kabKota} ${s.satelit} ${s.confidence}`.toLowerCase().includes(q)
    );
  }, [summaryRecords, query]);

  const totalCounter = useMemo(
    () => filteredSummary.reduce((acc, s) => acc + s.counter, 0),
    [filteredSummary]
  );

  return (
    <div className="space-y-5">
      {/* Header & Switch */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Rekapitulasi & Dokumen Sumber Resmi (79 Halaman)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verifikasi silang tabel ringkasan halaman 1–10 (209 baris, total <span className="font-mono tabular-nums font-medium">1.064</span> hotspot) dengan lampiran PDF asli.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setTab('summary')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'summary'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tabel Rekapitulasi (209 Baris)
            </button>
            <button
              type="button"
              onClick={() => setTab('pdf')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'pdf'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Pratinjau PDF Asli
            </button>
          </div>

          <a
            href={PDF_PATH}
            download="sebaran-hotspot.pdf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Unduh PDF
          </a>
        </div>
      </section>

      {tab === 'summary' ? (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari provinsi, kab/kota, satelit..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>

            <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              {filteredSummary.length} baris · Jumlah Counter: <span className="font-semibold text-orange-600 dark:text-orange-400">{totalCounter.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">No</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Provinsi</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Kab / Kota</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Satelit</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Confidence</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Counter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSummary.map((row) => {
                  const color = getConfidenceColor(row.confidence);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onFocusKabKota(row.provinsi, row.kabKota)}
                      className="h-9 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2 font-mono tabular-nums text-slate-400 dark:text-slate-500">
                        {row.id}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                        {row.provinsi}
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                        {row.kabKota}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300">
                        {row.satelit}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5 font-medium" style={{ color }}>
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: color }}
                            aria-hidden="true"
                          />
                          {getConfidenceLabelID(row.confidence)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {row.counter}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              Lampiran Asli: sebaran-hotspot_801db754.pdf (79 halaman)
            </span>
            <a
              href={PDF_PATH}
              download="sebaran-hotspot.pdf"
              className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              Simpan Salinan PDF
            </a>
          </div>
          <div className="h-[640px] w-full bg-slate-100 dark:bg-slate-950">
            <iframe
              src={PDF_PATH}
              title="Dokumen Sumber Data Karhutla"
              className="w-full h-full border-0"
            />
          </div>
        </section>
      )}
    </div>
  );
}
