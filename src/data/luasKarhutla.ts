// Luas kebakaran hutan & lahan per provinsi (hektare), tahun 2023 dan 2026.
// Sumber: rekap "luas-karhutla-provinsi.pdf" (kolom 2023 & 2026).
// Total sesuai dokumen: 2023 = 1.161.192,90 ha · 2026 = 202.010,96 ha.

export interface LuasKarhutlaRecord {
  kode: string;
  provinsi: string;
  ha2023: number;
  ha2026: number;
}

export const LUAS_TAHUN_A = 2023;
export const LUAS_TAHUN_B = 2026;

export const LUAS_KARHUTLA: LuasKarhutlaRecord[] = [
  { kode: '11', provinsi: 'Aceh', ha2023: 1936.86, ha2026: 4070.48 },
  { kode: '51', provinsi: 'Bali', ha2023: 2011.27, ha2026: 108.28 },
  { kode: '19', provinsi: 'Bangka Belitung', ha2023: 4752.98, ha2026: 335.63 },
  { kode: '36', provinsi: 'Banten', ha2023: 1.01, ha2026: 8.28 },
  { kode: '17', provinsi: 'Bengkulu', ha2023: 75.94, ha2026: 125.15 },
  { kode: '31', provinsi: 'DKI Jakarta', ha2023: 0, ha2026: 0 },
  { kode: '75', provinsi: 'Gorontalo', ha2023: 666.33, ha2026: 455.95 },
  { kode: '15', provinsi: 'Jambi', ha2023: 6539.68, ha2026: 379.0 },
  { kode: '32', provinsi: 'Jawa Barat', ha2023: 11524.8, ha2026: 1892.97 },
  { kode: '33', provinsi: 'Jawa Tengah', ha2023: 9965.59, ha2026: 947.97 },
  { kode: '35', provinsi: 'Jawa Timur', ha2023: 49498.32, ha2026: 10835.28 },
  { kode: '61', provinsi: 'Kalimantan Barat', ha2023: 111848.43, ha2026: 38310.86 },
  { kode: '63', provinsi: 'Kalimantan Selatan', ha2023: 190394.58, ha2026: 8019.63 },
  { kode: '62', provinsi: 'Kalimantan Tengah', ha2023: 165896.44, ha2026: 7634.46 },
  { kode: '64', provinsi: 'Kalimantan Timur', ha2023: 39494.41, ha2026: 2715.76 },
  { kode: '65', provinsi: 'Kalimantan Utara', ha2023: 796.36, ha2026: 400.62 },
  { kode: '21', provinsi: 'Kepulauan Riau', ha2023: 724.26, ha2026: 5760.9 },
  { kode: '18', provinsi: 'Lampung', ha2023: 6506.67, ha2026: 4890.26 },
  { kode: '81', provinsi: 'Maluku', ha2023: 45999.39, ha2026: 14677.0 },
  { kode: '82', provinsi: 'Maluku Utara', ha2023: 542.18, ha2026: 589.64 },
  { kode: '52', provinsi: 'Nusa Tenggara Barat', ha2023: 66716.43, ha2026: 17406.46 },
  { kode: '53', provinsi: 'Nusa Tenggara Timur', ha2023: 102536.89, ha2026: 19565.16 },
  { kode: '91', provinsi: 'Papua', ha2023: 604.01, ha2026: 544.61 },
  { kode: '92', provinsi: 'Papua Barat', ha2023: 259.03, ha2026: 2496.39 },
  { kode: '96', provinsi: 'Papua Barat Daya', ha2023: 504.24, ha2026: 716.7 },
  { kode: '95', provinsi: 'Papua Pegunungan', ha2023: 787.11, ha2026: 1681.43 },
  { kode: '93', provinsi: 'Papua Selatan', ha2023: 150813.34, ha2026: 25838.53 },
  { kode: '94', provinsi: 'Papua Tengah', ha2023: 2593.91, ha2026: 2519.88 },
  { kode: '14', provinsi: 'Riau', ha2023: 7267.03, ha2026: 15738.92 },
  { kode: '76', provinsi: 'Sulawesi Barat', ha2023: 2132.31, ha2026: 865.6 },
  { kode: '73', provinsi: 'Sulawesi Selatan', ha2023: 6489.26, ha2026: 1489.5 },
  { kode: '72', provinsi: 'Sulawesi Tengah', ha2023: 10844.28, ha2026: 3138.1 },
  { kode: '74', provinsi: 'Sulawesi Tenggara', ha2023: 18736.47, ha2026: 2735.48 },
  { kode: '71', provinsi: 'Sulawesi Utara', ha2023: 2531.44, ha2026: 368.78 },
  { kode: '13', provinsi: 'Sumatera Barat', ha2023: 4885.13, ha2026: 1491.07 },
  { kode: '16', provinsi: 'Sumatera Selatan', ha2023: 132082.86, ha2026: 1926.23 },
  { kode: '12', provinsi: 'Sumatera Utara', ha2023: 2113.75, ha2026: 1330.0 },
  { kode: '34', provinsi: 'Yogyakarta', ha2023: 119.91, ha2026: 0 },
];
