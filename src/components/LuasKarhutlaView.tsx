import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import { LUAS_KARHUTLA, LUAS_YEARS, type LuasKarhutlaRecord } from '../data/luasKarhutla';

// ---------------------------------------------------------------------------
// Perbandingan luas karhutla per provinsi, 4 tahun (2023–2026), hektare
// ---------------------------------------------------------------------------

const YEAR_COLOR = ['bg-slate-400 dark:bg-slate-500', 'bg-amber-400', 'bg-sky-500', 'bg-orange-600'];
const YEAR_TEXT = [
  'text-slate-700 dark:text-slate-300',
  'text-amber-600 dark:text-amber-400',
  'text-sky-600 dark:text-sky-400',
  'text-orange-600 dark:text-orange-400',
];
const LAST = LUAS_YEARS.length - 1;

const fmtHa = (v: number, digits = 0) =>
  v.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} jt`;
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

export function LuasKarhutlaView() {
  const [sortIdx, setSortIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(LAST);

  const totals = useMemo(
    () => LUAS_YEARS.map((_, i) => LUAS_KARHUTLA.reduce((s, r) => s + r.ha[i], 0)),
    []
  );
  const maxTotal = Math.max(...totals);

  const ranked = useMemo(
    () => [...LUAS_KARHUTLA].sort((x, y) => y.ha[sortIdx] - x.ha[sortIdx]),
    [sortIdx]
  );
  const visible = showAll ? ranked : ranked.slice(0, 10);
  const maxBar = Math.max(1, ...visible.flatMap((r) => r.ha));

  const changes = useMemo(() => {
    const withDelta = LUAS_KARHUTLA.map((r) => ({ ...r, delta: r.ha[toIdx] - r.ha[fromIdx] }));
    const turun = withDelta.filter((r) => r.delta < 0).sort((x, y) => x.delta - y.delta).slice(0, 5);
    const naik = withDelta.filter((r) => r.delta > 0).sort((x, y) => y.delta - x.delta).slice(0, 5);
    const nNaik = withDelta.filter((r) => r.delta > 0).length;
    const maxAbs = Math.max(1, ...turun.map((r) => -r.delta), ...naik.map((r) => r.delta));
    return { turun, naik, nNaik, maxAbs };
  }, [fromIdx, toIdx]);

  const islands = useMemo(() => {
    const acc = new Map<Island, number[]>();
    for (const i of ISLAND_ORDER) acc.set(i, LUAS_YEARS.map(() => 0));
    for (const r of LUAS_KARHUTLA) {
      const v = acc.get(islandOf(r.provinsi))!;
      r.ha.forEach((x, i) => (v[i] += x));
    }
    return ISLAND_ORDER.map((island) => ({ island, ha: acc.get(island)! }));
  }, []);

  const insights = useMemo(() => {
    const yr = (i: number) => LUAS_YEARS[i];
    const peak = totals.indexOf(Math.max(...totals));
    const low = totals.indexOf(Math.min(...totals));
    const topOf = (i: number) => [...LUAS_KARHUTLA].sort((x, y) => y.ha[i] - x.ha[i])[0];
    const top3 = [...LUAS_KARHUTLA].sort((x, y) => y.ha[0] - x.ha[0]).slice(0, 3);
    const top3Share = (top3.reduce((s, r) => s + r.ha[0], 0) / totals[0]) * 100;
    const rebound = totals[LAST] / Math.max(1, totals[LAST - 1]);
    const ntt = LUAS_KARHUTLA.find((r) => r.provinsi === 'Nusa Tenggara Timur');
    const list = [
      `Puncaknya tahun ${yr(peak)} (${fmtHa(totals[peak])} ha), terendah tahun ${yr(low)} (${fmtHa(totals[low])} ha).`,
      `Polanya turun tajam ${yr(0)} → ${yr(2)}, lalu naik lagi di ${yr(LAST)}: ${fmtHa(totals[LAST])} ha, sekitar ${rebound.toLocaleString('id-ID', { maximumFractionDigits: 0 })} kali lipat dari ${yr(LAST - 1)}, tapi masih ${fmtPct(pct(totals[0], totals[LAST]))} dibanding ${yr(0)}.`,
      `Tahun ${yr(0)} paling parah di ${topOf(0).provinsi} (${fmtHa(topOf(0).ha[0])} ha). Tiga provinsi teratas (${top3.map((r) => r.provinsi).join(', ')}) menyumbang ${top3Share.toLocaleString('id-ID', { maximumFractionDigits: 0 })}% luas nasional.`,
      `Provinsi terluas berganti-ganti: ${LUAS_YEARS.map((y, i) => `${y} ${topOf(i).provinsi}`).join(' · ')}.`,
    ];
    const top10 = [...LUAS_KARHUTLA].sort((x, y) => y.ha[0] - x.ha[0]).slice(0, 10);
    const naik10 = top10.filter((r) => r.ha[1] > r.ha[0]);
    if (naik10.length === 1)
      list.push(
        `${naik10[0].provinsi} satu-satunya dari 10 provinsi terluas ${yr(0)} yang justru naik di ${yr(1)} (${fmtHa(naik10[0].ha[0])} → ${fmtHa(naik10[0].ha[1])} ha).`
      );
    return list;
  }, [totals]);

  return (
    <div className="space-y-5">
      {/* Judul */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
          Luas Kebakaran Hutan &amp; Lahan per Provinsi, {LUAS_YEARS[0]}–{LUAS_YEARS[LAST]}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Berbeda dengan peta titik panas (deteksi satelit selama 2 hari), bagian ini membandingkan{' '}
          <strong className="text-slate-700 dark:text-slate-300">luas area yang terbakar per tahun</strong> di 38
          provinsi, dalam hektare (ha). Sumber: rekap luas karhutla per provinsi.
        </p>
      </section>

      {/* KPI per tahun */}
      <section
        aria-label="Total luas per tahun"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200 dark:divide-slate-800"
      >
        {LUAS_YEARS.map((y, i) => {
          const p = i === 0 ? null : pct(totals[i - 1], totals[i]);
          return (
            <div key={y} className="p-4 sm:p-5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${YEAR_COLOR[i]}`} /> Total {y}
              </div>
              <div className={`mt-2 text-xl sm:text-2xl font-display font-bold font-mono tabular-nums ${YEAR_TEXT[i]}`}>
                {fmtHa(totals[i])} <span className="text-sm font-medium">ha</span>
              </div>
              <div
                className={`text-xs font-mono tabular-nums mt-0.5 ${
                  p === null
                    ? 'text-slate-400'
                    : p > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {p === null ? 'tahun dasar' : `${fmtPct(p)} dari ${LUAS_YEARS[i - 1]}`}
              </div>
            </div>
          );
        })}
      </section>

      {/* Tren nasional */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Tren nasional</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total luas terbakar seluruh provinsi per tahun</p>
        <div className="mt-4 grid grid-cols-4 gap-3 sm:gap-6 items-end h-48">
          {LUAS_YEARS.map((y, i) => (
            <div key={y} className="flex flex-col items-center justify-end h-full" title={`${y}: ${fmtHa(totals[i], 2)} ha`}>
              <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 mb-1">
                {fmtShort(totals[i])}
              </span>
              <div
                className={`w-full max-w-24 rounded-t-md ${YEAR_COLOR[i]}`}
                style={{ height: `${Math.max(1.5, (totals[i] / maxTotal) * 85)}%` }}
              />
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">{y}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Grafik per provinsi */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {showAll ? 'Semua provinsi' : `10 provinsi terluas (${LUAS_YEARS[sortIdx]})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Luas terbakar (ha) per tahun</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Urutkan:</span>
              <Segmented
                options={LUAS_YEARS.map((y, i) => ({ id: String(i), label: String(y) }))}
                value={String(sortIdx)}
                onChange={(v) => setSortIdx(Number(v))}
              />
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {showAll ? 'Tampilkan 10 saja' : `Semua (${LUAS_KARHUTLA.length})`}
              </button>
            </div>
          </div>

          <Legend />

          <ul className="mt-3 space-y-4">
            {visible.map((r) => (
              <ProvinceRow key={r.kode} r={r} max={maxBar} />
            ))}
          </ul>
        </section>

        <div className="lg:col-span-5 space-y-5">
          {/* Perubahan terbesar */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Perubahan terbesar</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Dari</span>
              <YearSelect value={fromIdx} onChange={setFromIdx} />
              <span>ke</span>
              <YearSelect value={toIdx} onChange={setToIdx} />
            </div>

            {fromIdx === toIdx ? (
              <p className="mt-4 text-xs text-slate-500">Pilih dua tahun yang berbeda.</p>
            ) : (
              <>
                <div className="mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Turun paling banyak
                </div>
                <ul className="mt-2 space-y-2">
                  {changes.turun.map((r) => (
                    <DeltaRow key={r.kode} r={r} delta={r.delta} max={changes.maxAbs} from={fromIdx} to={toIdx} />
                  ))}
                </ul>

                <div className="mt-5 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Naik paling banyak
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    ({changes.nNaik} dari {LUAS_KARHUTLA.length} provinsi naik)
                  </span>
                </div>
                <ul className="mt-2 space-y-2">
                  {changes.naik.length === 0 && <li className="text-xs text-slate-500">Tidak ada provinsi yang naik.</li>}
                  {changes.naik.map((r) => (
                    <DeltaRow key={r.kode} r={r} delta={r.delta} max={changes.maxAbs} from={fromIdx} to={toIdx} />
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* Porsi per pulau */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Porsi per pulau</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bagian tiap pulau dari total luas nasional di tahun itu
            </p>
            {LUAS_YEARS.map((y, yi) => (
              <div key={y} className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{y}</span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">{fmtHa(totals[yi])} ha</span>
                </div>
                <div className="flex h-5 rounded-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                  {islands.map((i) => {
                    const share = (i.ha[yi] / totals[yi]) * 100;
                    return (
                      <div
                        key={i.island}
                        className={`${ISLAND_COLOR[i.island]} h-full`}
                        style={{ width: `${share}%` }}
                        title={`${i.island} ${y}: ${fmtHa(i.ha[yi])} ha (${share.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <ul className="mt-4 space-y-1.5 text-xs">
              {islands.map((i) => (
                <li key={i.island} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${ISLAND_COLOR[i.island]}`} />
                    <span className="truncate">{i.island}</span>
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {i.ha.map((v, yi) => `${Math.round((v / totals[yi]) * 100)}%`).join(' → ')}
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
          Semua angka diambil apa adanya dari dokumen rekap luas karhutla per provinsi {LUAS_YEARS[0]}–{LUAS_YEARS[LAST]}.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponen kecil
// ---------------------------------------------------------------------------

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
      {LUAS_YEARS.map((y, i) => (
        <span key={y} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm ${YEAR_COLOR[i]}`} /> {y}
        </span>
      ))}
    </div>
  );
}

function ProvinceRow({ r, max }: { r: LuasKarhutlaRecord; max: number }) {
  const p = pct(r.ha[0], r.ha[LAST]);
  const up = r.ha[LAST] > r.ha[0];
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{r.provinsi}</span>
        <span
          className={`font-mono tabular-nums whitespace-nowrap ${
            up ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
          title={`Perubahan ${LUAS_YEARS[0]} → ${LUAS_YEARS[LAST]}`}
        >
          {LUAS_YEARS[0]}→{LUAS_YEARS[LAST]}: {fmtPct(p)}
        </span>
      </div>
      {r.ha.map((v, i) => (
        <Bar key={i} value={v} max={max} cls={YEAR_COLOR[i]} year={LUAS_YEARS[i]} />
      ))}
    </li>
  );
}

function Bar({ value, max, cls, year }: { value: number; max: number; cls: string; year: number }) {
  const w = value > 0 ? Math.max(0.6, (value / max) * 100) : 0;
  return (
    <div className="mt-0.5 flex items-center gap-2" title={`${year}: ${fmtHa(value, 2)} ha`}>
      <span className="w-8 text-[10px] font-mono tabular-nums text-slate-400">{year}</span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
        <div className={`h-full ${cls} rounded-sm`} style={{ width: `${w}%` }} />
      </div>
      <span className="w-14 text-right text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
        {fmtShort(value)}
      </span>
    </div>
  );
}

function DeltaRow({
  r,
  delta,
  max,
  from,
  to,
}: {
  r: LuasKarhutlaRecord;
  delta: number;
  max: number;
  from: number;
  to: number;
}) {
  const up = delta > 0;
  return (
    <li title={`${r.provinsi}: ${fmtHa(r.ha[from], 2)} → ${fmtHa(r.ha[to], 2)} ha`}>
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

function YearSelect({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
    >
      {LUAS_YEARS.map((y, i) => (
        <option key={y} value={i}>
          {y}
        </option>
      ))}
    </select>
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
          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
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
