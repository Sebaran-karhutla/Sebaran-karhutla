import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import {
  LUAS_KARHUTLA,
  LUAS_TAHUN_A,
  LUAS_TAHUN_B,
  type LuasKarhutlaRecord,
} from '../data/luasKarhutla';

// ---------------------------------------------------------------------------
// Perbandingan luas karhutla per provinsi: 2023 vs 2026 (hektare)
// ---------------------------------------------------------------------------

const fmtHa = (v: number, digits = 0) =>
  v.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const fmtShort = (v: number) => {
  if (v >= 1000) return `${(v / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`;
  return fmtHa(v);
};

const pct = (a: number, b: number) => (a === 0 ? null : ((b - a) / a) * 100);

const fmtPct = (p: number | null) =>
  p === null ? 'baru' : `${p > 0 ? '+' : ''}${p.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;

type Island = 'Sumatera' | 'Jawa & Bali' | 'Kalimantan' | 'Sulawesi' | 'Nusa Tenggara' | 'Maluku' | 'Papua';

const ISLAND_ORDER: Island[] = ['Kalimantan', 'Sumatera', 'Papua', 'Nusa Tenggara', 'Jawa & Bali', 'Sulawesi', 'Maluku'];

const ISLAND_COLOR: Record<Island, string> = {
  Kalimantan: 'bg-orange-600',
  Sumatera: 'bg-amber-500',
  Papua: 'bg-rose-600',
  'Nusa Tenggara': 'bg-yellow-400',
  'Jawa & Bali': 'bg-sky-500',
  Sulawesi: 'bg-teal-500',
  Maluku: 'bg-indigo-500',
};

function islandOf(provinsi: string): Island {
  if (provinsi.startsWith('Kalimantan')) return 'Kalimantan';
  if (provinsi.startsWith('Papua')) return 'Papua';
  if (provinsi.startsWith('Sulawesi') || provinsi === 'Gorontalo') return 'Sulawesi';
  if (provinsi.startsWith('Maluku')) return 'Maluku';
  if (provinsi.startsWith('Nusa Tenggara')) return 'Nusa Tenggara';
  if (['Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Yogyakarta', 'Bali'].includes(provinsi))
    return 'Jawa & Bali';
  return 'Sumatera'; // Aceh, Sumut, Sumbar, Riau, Kepri, Jambi, Sumsel, Babel, Bengkulu, Lampung
}

type SortKey = 'a' | 'b';

export function LuasKarhutlaView() {
  const [sortBy, setSortBy] = useState<SortKey>('a');
  const [showAll, setShowAll] = useState(false);

  const totals = useMemo(() => {
    const a = LUAS_KARHUTLA.reduce((s, r) => s + r.ha2023, 0);
    const b = LUAS_KARHUTLA.reduce((s, r) => s + r.ha2026, 0);
    const naik = LUAS_KARHUTLA.filter((r) => r.ha2026 > r.ha2023);
    return { a, b, change: pct(a, b), naik };
  }, []);

  const ranked = useMemo(() => {
    const key = sortBy === 'a' ? 'ha2023' : 'ha2026';
    return [...LUAS_KARHUTLA].sort((x, y) => y[key] - x[key]);
  }, [sortBy]);

  const visible = showAll ? ranked : ranked.slice(0, 10);
  const maxBar = Math.max(1, ...visible.map((r) => Math.max(r.ha2023, r.ha2026)));

  const changes = useMemo(() => {
    const withDelta = LUAS_KARHUTLA.map((r) => ({ ...r, delta: r.ha2026 - r.ha2023 }));
    const turun = [...withDelta].sort((x, y) => x.delta - y.delta).slice(0, 5);
    const naik = withDelta.filter((r) => r.delta > 0).sort((x, y) => y.delta - x.delta).slice(0, 5);
    const maxAbs = Math.max(1, ...turun.map((r) => -r.delta), ...naik.map((r) => r.delta));
    return { turun, naik, maxAbs };
  }, []);

  const islands = useMemo(() => {
    const acc = new Map<Island, { a: number; b: number }>();
    for (const i of ISLAND_ORDER) acc.set(i, { a: 0, b: 0 });
    for (const r of LUAS_KARHUTLA) {
      const v = acc.get(islandOf(r.provinsi))!;
      v.a += r.ha2023;
      v.b += r.ha2026;
    }
    return ISLAND_ORDER.map((i) => ({ island: i, ...acc.get(i)! }));
  }, []);

  const insights = useMemo(() => {
    const topA = [...LUAS_KARHUTLA].sort((x, y) => y.ha2023 - x.ha2023)[0];
    const topB = [...LUAS_KARHUTLA].sort((x, y) => y.ha2026 - x.ha2026)[0];
    const top3A = [...LUAS_KARHUTLA].sort((x, y) => y.ha2023 - x.ha2023).slice(0, 3);
    const top3Share = (top3A.reduce((s, r) => s + r.ha2023, 0) / totals.a) * 100;
    const bigUp = changes.naik[0];
    const kal = islands.find((i) => i.island === 'Kalimantan')!;
    return [
      `Secara nasional luas karhutla turun dari ${fmtHa(totals.a)} ha (${LUAS_TAHUN_A}) menjadi ${fmtHa(totals.b)} ha (${LUAS_TAHUN_B}), atau ${fmtPct(totals.change)}.`,
      `Tahun ${LUAS_TAHUN_A} paling parah di ${topA.provinsi} (${fmtHa(topA.ha2023)} ha). Tiga provinsi teratas (${top3A.map((r) => r.provinsi).join(', ')}) menyumbang ${top3Share.toLocaleString('id-ID', { maximumFractionDigits: 0 })}% dari total.`,
      `Tahun ${LUAS_TAHUN_B} posisi teratas berpindah ke ${topB.provinsi} (${fmtHa(topB.ha2026)} ha).`,
      `Kalimantan turun dari ${fmtShort(kal.a)} ha menjadi ${fmtShort(kal.b)} ha, tapi tetap pulau dengan luas terbesar.`,
      bigUp
        ? `Tidak semua turun: ${totals.naik.length} dari ${LUAS_KARHUTLA.length} provinsi justru naik, terbesar ${bigUp.provinsi} (${fmtHa(bigUp.ha2023)} → ${fmtHa(bigUp.ha2026)} ha).`
        : '',
    ].filter(Boolean);
  }, [totals, changes, islands]);

  return (
    <div className="space-y-5">
      {/* Judul */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
          Luas Kebakaran Hutan &amp; Lahan per Provinsi: {LUAS_TAHUN_A} vs {LUAS_TAHUN_B}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Berbeda dengan peta titik panas (jumlah deteksi satelit selama 2 hari), bagian ini membandingkan{' '}
          <strong className="text-slate-700 dark:text-slate-300">luas area yang terbakar dalam setahun</strong>, dalam
          hektare (ha). Sumber: rekap luas karhutla per provinsi.
        </p>
      </section>

      {/* KPI */}
      <section
        aria-label="Ringkasan luas karhutla"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800"
      >
        <Kpi label={`Total luas ${LUAS_TAHUN_A}`} value={`${fmtHa(totals.a)} ha`} sub="38 provinsi" />
        <Kpi label={`Total luas ${LUAS_TAHUN_B}`} value={`${fmtHa(totals.b)} ha`} sub="38 provinsi" accent />
        <Kpi
          label="Perubahan nasional"
          value={fmtPct(totals.change)}
          sub={`${fmtHa(totals.b - totals.a)} ha`}
          tone="down"
        />
        <Kpi
          label="Provinsi yang justru naik"
          value={`${totals.naik.length} dari ${LUAS_KARHUTLA.length}`}
          sub="lihat panel Perubahan Terbesar"
          tone="up"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Grafik batang berpasangan */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {showAll ? 'Semua provinsi' : '10 provinsi terluas'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Luas terbakar (ha), dua tahun berdampingan</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                options={[
                  { id: 'a', label: `Urut ${LUAS_TAHUN_A}` },
                  { id: 'b', label: `Urut ${LUAS_TAHUN_B}` },
                ]}
                value={sortBy}
                onChange={(v) => setSortBy(v as SortKey)}
              />
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {showAll ? 'Tampilkan 10 saja' : `Tampilkan semua (${LUAS_KARHUTLA.length})`}
              </button>
            </div>
          </div>

          <Legend />

          <ul className="mt-3 space-y-3">
            {visible.map((r) => (
              <PairRow key={r.kode} r={r} max={maxBar} />
            ))}
          </ul>
        </section>

        <div className="lg:col-span-5 space-y-5">
          {/* Perubahan terbesar */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Perubahan terbesar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selisih luas {LUAS_TAHUN_B} dikurangi {LUAS_TAHUN_A} (ha)
            </p>

            <div className="mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Turun paling banyak
            </div>
            <ul className="mt-2 space-y-2">
              {changes.turun.map((r) => (
                <DeltaRow key={r.kode} r={r} delta={r.delta} max={changes.maxAbs} />
              ))}
            </ul>

            <div className="mt-5 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Naik paling banyak
            </div>
            <ul className="mt-2 space-y-2">
              {changes.naik.map((r) => (
                <DeltaRow key={r.kode} r={r} delta={r.delta} max={changes.maxAbs} />
              ))}
            </ul>
          </section>

          {/* Porsi per pulau */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Porsi per pulau</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bagian tiap pulau dari total luas nasional di tahun itu
            </p>
            {([['a', LUAS_TAHUN_A, totals.a], ['b', LUAS_TAHUN_B, totals.b]] as const).map(([k, year, total]) => (
              <div key={k} className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{year}</span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">{fmtHa(total)} ha</span>
                </div>
                <div className="flex h-6 rounded-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                  {islands.map((i) => {
                    const v = k === 'a' ? i.a : i.b;
                    const share = (v / total) * 100;
                    return (
                      <div
                        key={i.island}
                        className={`${ISLAND_COLOR[i.island]} h-full`}
                        style={{ width: `${share}%` }}
                        title={`${i.island}: ${fmtHa(v)} ha (${share.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {islands.map((i) => (
                <li key={i.island} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${ISLAND_COLOR[i.island]}`} />
                    <span className="truncate">{i.island}</span>
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {Math.round((i.a / totals.a) * 100)}% → {Math.round((i.b / totals.b) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Temuan */}
      <section className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 rounded-xl p-5">
        <h3 className="text-base font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-2">
          <Info className="w-4 h-4" /> Temuan utama
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
          {insights.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Catatan: angka {LUAS_TAHUN_B} mengikuti dokumen sumber; kalau rekap tahun itu belum mencakup satu tahun penuh,
          perbandingannya bisa berubah saat data final keluar.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponen kecil
// ---------------------------------------------------------------------------

function Kpi({
  label,
  value,
  sub,
  accent,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  tone?: 'up' | 'down';
}) {
  const color =
    tone === 'down'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'up'
        ? 'text-red-600 dark:text-red-400'
        : accent
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-slate-900 dark:text-slate-100';
  return (
    <div className="p-5">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-display font-bold font-mono tabular-nums ${color}`}>{value}</div>
      <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-slate-400 dark:bg-slate-500" /> {LUAS_TAHUN_A}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-orange-600" /> {LUAS_TAHUN_B}
      </span>
    </div>
  );
}

function PairRow({ r, max }: { r: LuasKarhutlaRecord; max: number }) {
  const p = pct(r.ha2023, r.ha2026);
  const up = r.ha2026 > r.ha2023;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{r.provinsi}</span>
        <span
          className={`font-mono tabular-nums whitespace-nowrap ${
            up ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {fmtPct(p)}
        </span>
      </div>
      <Bar value={r.ha2023} max={max} cls="bg-slate-400 dark:bg-slate-500" year={LUAS_TAHUN_A} />
      <Bar value={r.ha2026} max={max} cls="bg-orange-600" year={LUAS_TAHUN_B} />
    </li>
  );
}

function Bar({ value, max, cls, year }: { value: number; max: number; cls: string; year: number }) {
  const w = Math.max(value > 0 ? 0.6 : 0, (value / max) * 100);
  return (
    <div className="mt-1 flex items-center gap-2" title={`${year}: ${fmtHa(value, 2)} ha`}>
      <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
        <div className={`h-full ${cls} rounded-sm`} style={{ width: `${w}%` }} />
      </div>
      <span className="w-16 text-right text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
        {fmtShort(value)}
      </span>
    </div>
  );
}

function DeltaRow({ r, delta, max }: { r: LuasKarhutlaRecord; delta: number; max: number }) {
  const up = delta > 0;
  return (
    <li title={`${r.provinsi}: ${fmtHa(r.ha2023, 2)} → ${fmtHa(r.ha2026, 2)} ha`}>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-slate-700 dark:text-slate-300 truncate">{r.provinsi}</span>
        <span className="font-mono tabular-nums whitespace-nowrap text-slate-500 dark:text-slate-400">
          {up ? '+' : '−'}
          {fmtHa(Math.abs(delta))} ha
        </span>
      </div>
      <div className="mt-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm ${up ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.max(1, (Math.abs(delta) / max) * 100)}%` }}
        />
      </div>
    </li>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            value === o.id
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
