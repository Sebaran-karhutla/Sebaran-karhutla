// Luas kebakaran hutan & lahan per provinsi (hektare), 2023–2026.
// Sumber: rekap "luas-karhutla-provinsi.pdf" (semua kolom diambil apa adanya).
// Total sesuai dokumen:
//   2023 = 1.161.192,90 · 2024 = 376.805,05 · 2025 = 12.226,72 · 2026 = 202.010,96

export const LUAS_YEARS = [2023, 2024, 2025, 2026] as const;
export type LuasYear = (typeof LUAS_YEARS)[number];

export interface LuasKarhutlaRecord {
  kode: string;
  provinsi: string;
  /** luas (ha) berurutan sesuai LUAS_YEARS */
  ha: [number, number, number, number];
}

export const LUAS_KARHUTLA: LuasKarhutlaRecord[] = [
  { kode: '11', provinsi: 'Aceh', ha: [1936.86, 7257.35, 355.01, 4070.48] },
  { kode: '51', provinsi: 'Bali', ha: [2011.27, 316.36, 93.08, 108.28] },
  { kode: '19', provinsi: 'Bangka Belitung', ha: [4752.98, 2915.46, 214.71, 335.63] },
  { kode: '36', provinsi: 'Banten', ha: [1.01, 362.83, 4.44, 8.28] },
  { kode: '17', provinsi: 'Bengkulu', ha: [75.94, 355.05, 157.81, 125.15] },
  { kode: '31', provinsi: 'DKI Jakarta', ha: [0, 0.51, 0, 0] },
  { kode: '75', provinsi: 'Gorontalo', ha: [666.33, 767.03, 89.86, 455.95] },
  { kode: '15', provinsi: 'Jambi', ha: [6539.68, 5636.69, 46.79, 379.0] },
  { kode: '32', provinsi: 'Jawa Barat', ha: [11524.8, 4548.58, 0.65, 1892.97] },
  { kode: '33', provinsi: 'Jawa Tengah', ha: [9965.59, 3726.78, 1372.29, 947.97] },
  { kode: '35', provinsi: 'Jawa Timur', ha: [49498.32, 20957.17, 233.97, 10835.28] },
  { kode: '61', provinsi: 'Kalimantan Barat', ha: [111848.43, 24154.63, 1209.06, 38310.86] },
  { kode: '63', provinsi: 'Kalimantan Selatan', ha: [190394.58, 4993.88, 24.35, 8019.63] },
  { kode: '62', provinsi: 'Kalimantan Tengah', ha: [165896.44, 11459.89, 149.06, 7634.46] },
  { kode: '64', provinsi: 'Kalimantan Timur', ha: [39494.41, 22570.5, 342.95, 2715.76] },
  { kode: '65', provinsi: 'Kalimantan Utara', ha: [796.36, 2429.21, 80.95, 400.62] },
  { kode: '21', provinsi: 'Kepulauan Riau', ha: [724.26, 1498.66, 141.65, 5760.9] },
  { kode: '18', provinsi: 'Lampung', ha: [6506.67, 13242.01, 514.73, 4890.26] },
  { kode: '81', provinsi: 'Maluku', ha: [45999.39, 13404.83, 421.53, 14677.0] },
  { kode: '82', provinsi: 'Maluku Utara', ha: [542.18, 102.57, 27.53, 589.64] },
  { kode: '52', provinsi: 'Nusa Tenggara Barat', ha: [66716.43, 46189.73, 1867.35, 17406.46] },
  { kode: '53', provinsi: 'Nusa Tenggara Timur', ha: [102536.89, 113089.51, 1493.02, 19565.16] },
  { kode: '91', provinsi: 'Papua', ha: [604.01, 544.19, 63.33, 544.61] },
  { kode: '92', provinsi: 'Papua Barat', ha: [259.03, 198.85, 203.38, 2496.39] },
  { kode: '96', provinsi: 'Papua Barat Daya', ha: [504.24, 28.42, 189.12, 716.7] },
  { kode: '95', provinsi: 'Papua Pegunungan', ha: [787.11, 461.56, 73.42, 1681.43] },
  { kode: '93', provinsi: 'Papua Selatan', ha: [150813.34, 27182.19, 32.0, 25838.53] },
  { kode: '94', provinsi: 'Papua Tengah', ha: [2593.91, 104.02, 89.01, 2519.88] },
  { kode: '14', provinsi: 'Riau', ha: [7267.03, 11027.96, 751.08, 15738.92] },
  { kode: '76', provinsi: 'Sulawesi Barat', ha: [2132.31, 994.74, 172.29, 865.6] },
  { kode: '73', provinsi: 'Sulawesi Selatan', ha: [6489.26, 3522.91, 474.91, 1489.5] },
  { kode: '72', provinsi: 'Sulawesi Tengah', ha: [10844.28, 4920.7, 312.15, 3138.1] },
  { kode: '74', provinsi: 'Sulawesi Tenggara', ha: [18736.47, 1629.74, 100.01, 2735.48] },
  { kode: '71', provinsi: 'Sulawesi Utara', ha: [2531.44, 651.68, 6.51, 368.78] },
  { kode: '13', provinsi: 'Sumatera Barat', ha: [4885.13, 3052.2, 514.48, 1491.07] },
  { kode: '16', provinsi: 'Sumatera Selatan', ha: [132082.86, 15422.48, 43.08, 1926.23] },
  { kode: '12', provinsi: 'Sumatera Utara', ha: [2113.75, 7032.27, 361.16, 1330.0] },
  { kode: '34', provinsi: 'Yogyakarta', ha: [119.91, 51.91, 0, 0] },
];
