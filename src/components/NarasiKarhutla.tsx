import { AlertTriangle, BookOpen, ExternalLink } from 'lucide-react';
import { JAN_JUL, KESIMPULAN, NARASI, SUMBER } from '../data/narasiKarhutla';

// "Cerita di balik data": narasi + bukti + sumber resmi untuk perbandingan luas karhutla.

const fmtHa = (v: number) => v.toLocaleString('id-ID', { maximumFractionDigits: 0 });
const sumberIndex = (id: string) => SUMBER.findIndex((s) => s.id === id) + 1;

export function PeriodeWarning() {
  return (
    <section className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900 dark:text-amber-100">
        <strong>Perhatian: periode tiap tahun tidak sama.</strong> Kolom 2023 dan 2024 adalah total setahun penuh,
        sedangkan kolom 2026 baru berisi <strong>Januari–Juli</strong> (cocok dengan SiPongi: 202.004,30 ha) dan kolom
        2025 juga belum setahun penuh. Jadi angka 2026 yang lebih kecil <em>bukan</em> berarti kebakarannya lebih
        ringan. Lihat “Cerita di balik data” di bawah.
      </div>
    </section>
  );
}

export function NarasiKarhutla() {
  const maxJJ = Math.max(...JAN_JUL.map((d) => d.ha));
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-6">
      <div>
        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-600" /> Cerita di balik data: benarkah karhutla 2026 lebih kecil dari 2023?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Nomor dalam kurung siku [1], [2], … merujuk ke daftar sumber di bagian bawah.
        </p>
      </div>

      {/* Grafik apel-ke-apel */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Periode sama: luas karhutla Januari–Juli
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dihitung dari catatan SiPongi [1]: 2026 = 202.004,30 ha, lalu dikurangi selisih yang ditulis SiPongi untuk tiap tahun.
        </p>
        <div className="mt-4 space-y-2.5">
          {JAN_JUL.map((d) => {
            const is26 = d.tahun === 2026;
            return (
              <div key={d.tahun} className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {d.tahun}
                  {d.catatan === 'tahun El Niño' && (
                    <span className="block font-normal text-[10px] text-slate-400">tahun El Niño</span>
                  )}
                </span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${is26 ? 'bg-orange-600' : 'bg-slate-400 dark:bg-slate-500'}`}
                    style={{ width: `${(d.ha / maxJJ) * 100}%` }}
                  />
                </div>
                <span
                  className={`w-24 text-right text-xs font-mono tabular-nums ${
                    is26 ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {is26 ? '' : '≈ '}
                  {fmtHa(d.ha)} ha
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-medium text-orange-700 dark:text-orange-400">
          Januari–Juli 2026 = +80% dibanding 2023 dan +47% dibanding 2019 pada periode yang sama.
        </p>
      </div>

      {/* Bab narasi */}
      <ol className="space-y-5">
        {NARASI.map((b) => (
          <li key={b.judul} className="grid gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{b.judul}</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {b.isi}
              {b.sumber.length > 0 && (
                <span className="text-xs text-orange-700 dark:text-orange-400 font-mono">
                  {' '}
                  {b.sumber.map((id) => `[${sumberIndex(id)}]`).join('')}
                </span>
              )}
            </p>
            {b.bukti.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {b.bukti.map((t) => (
                  <li
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono tabular-nums"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {/* Kesimpulan */}
      <div className="rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-100 p-5 border border-slate-800">
        <div className="text-sm font-semibold text-orange-400">Kesimpulan</div>
        <ul className="mt-2 space-y-1.5 text-sm list-disc pl-5">
          {KESIMPULAN.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>

      {/* Sumber */}
      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sumber</div>
        <ol className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          {SUMBER.map((s, i) => (
            <li key={s.id} className="flex gap-2">
              <span className="font-mono text-slate-400 w-6 shrink-0">[{i + 1}]</span>
              <span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 dark:text-slate-200 underline decoration-slate-300 hover:text-orange-600 inline-flex items-center gap-1"
                >
                  {s.judul}
                  <ExternalLink className="w-3 h-3" />
                </a>{' '}
                · {s.penerbit} · {s.tanggal}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[11px] text-slate-400">
          Data luas wajib mencantumkan sumber: SIPONGI KEMENHUT. Angka “Januari–Juli” 2019/2023/2025 adalah hasil hitung dari
          selisih yang ditulis SiPongi, bukan angka yang ditulis langsung.
        </p>
      </div>
    </section>
  );
}
