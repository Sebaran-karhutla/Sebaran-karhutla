// Narasi "Cerita di balik data" + bukti + sumber resmi.
// Semua angka di sini dikutip dari sumber yang dicantumkan (dicek 23 Nov 2026).

export interface Sumber {
  id: string;
  judul: string;
  penerbit: string;
  tanggal: string;
  url: string;
}

export const SUMBER: Sumber[] = [
  {
    id: 'sipongi',
    judul: 'Indikasi Luas Kebakaran Hutan dan Lahan (catatan periode Januari–Juli 2026)',
    penerbit: 'SiPongi, Kementerian Kehutanan',
    tanggal: 'diakses 23 Nov 2026',
    url: 'https://sipongi.gakkum.kehutanan.go.id/indikasi-luas-kebakaran',
  },
  {
    id: 'kompas-okt26',
    judul: 'Luas Karhutla 2026 Melonjak, Perbaikan Tata Kelola Lahan dan Gambut Jadi Kunci',
    penerbit: 'Kompas.com (Lestari)',
    tanggal: '3 Okt 2026',
    url: 'https://lestari.kompas.com/read/2026/10/03/093745086/luas-karhutla-2026-melonjak-perbaikan-tata-kelola-lahan-dan-gambut-jadi',
  },
  {
    id: 'kompas-mar26',
    judul: 'Karhutla Awal 2026 Naik Dibandingkan Tahun El Nino 2019 dan 2023, Ada Apa?',
    penerbit: 'Kompas.com (Lestari)',
    tanggal: '25 Mar 2026',
    url: 'https://lestari.kompas.com/read/2026/03/25/204920386/karhutla-awal-2026-naik-dibandingkan-tahun-el-nino-2019-dan-2023-ada-apa',
  },
  {
    id: 'kompas-jun26',
    judul: 'Luas Karhutla Januari hingga Mei 2026 Tembus 81.000 Hektare',
    penerbit: 'Kompas.com (Lestari)',
    tanggal: '15 Jun 2026',
    url: 'https://lestari.kompas.com/read/2026/06/15/120100986/luas-karhutla-januari-hingga-mei-2026-tembus-81.000-hektare',
  },
  {
    id: 'bmkg-2023',
    judul: 'Analisis BMKG tentang Dampak El Nino di Musim Kemarau',
    penerbit: 'Kompas.com (Sains), mengutip BMKG',
    tanggal: '22 Jul 2023',
    url: 'https://www.kompas.com/sains/read/2023/07/22/152800823/analisis-bmkg-tentang-dampak-el-nino-di-musim-kemarau',
  },
  {
    id: 'antara-2023',
    judul: 'Kepala BMKG: Dampak El Nino 2023 Lebih Terkendali',
    penerbit: 'ANTARA',
    tanggal: '2023',
    url: 'https://www.antaranews.com/berita/3764775/kepala-bmkg-dampak-el-nino-2023-lebih-terkendali',
  },
  {
    id: 'goodstats',
    judul: 'Tren Luas Karhutla di Indonesia (data SiPongi)',
    penerbit: 'GoodStats',
    tanggal: '24 Apr 2026',
    url: 'https://data.goodstats.id/statistic/tren-luas-karhutla-di-indonesia-per-maret-2026-hampir-seluas-jakarta-I0vpd',
  },
  {
    id: 'kompas-2025',
    judul: 'Karhutla Indonesia 2025 Capai 359.000 Hektar, Ini 7 Provinsi yang Rawan',
    penerbit: 'Kompas.com (Lestari)',
    tanggal: '26 Mar 2026',
    url: 'https://lestari.kompas.com/read/2026/03/26/100600886/karhutla-indonesia-2025-capai-359.000-hektar-ini-7-provinsi-yang-rawan',
  },
  {
    id: 'bmkg-2025',
    judul: 'BMKG: Musim Kemarau Basah Diprediksi hingga Oktober 2025',
    penerbit: 'BMKG',
    tanggal: '2025',
    url: 'https://www.bmkg.go.id/berita/utama/bmkg-musim-kemarau-basah-diprediksi-hingga-oktober-2025-waspada-bencana-hidrometeorologi',
  },
];

/**
 * Perbandingan periode SAMA (Januari–Juli), dari catatan SiPongi:
 * "periode Januari – Juli 2026 (202.004,30 ha) mengalami PENINGKATAN sebesar 47% (64.996,88 ha)
 *  dibandingkan tahun 2019 ... 80% (109.080,25 ha) dibandingkan tahun 2023 ...
 *  dibandingkan tahun 2025 ... naik sebesar 69% (82.791,04 ha)."
 * Angka 2019/2023/2025 = 202.004,30 dikurangi selisih yang ditulis SiPongi.
 */
export const JAN_JUL: Array<{ tahun: number; ha: number; catatan: string }> = [
  { tahun: 2019, ha: 202004.3 - 64996.88, catatan: 'tahun El Niño' },
  { tahun: 2023, ha: 202004.3 - 109080.25, catatan: 'tahun El Niño' },
  { tahun: 2025, ha: 202004.3 - 82791.04, catatan: '' },
  { tahun: 2026, ha: 202004.3, catatan: 'SiPongi' },
];

export interface Bab {
  judul: string;
  isi: string;
  bukti: string[]; // poin bukti singkat
  sumber: string[]; // id dari SUMBER
}

export const NARASI: Bab[] = [
  {
    judul: '1. Sekilas, 2023 terlihat 6 kali lebih besar dari 2026',
    isi: 'Di data rekap, luas karhutla 2023 tercatat 1.161.193 ha, sedangkan 2026 hanya 202.011 ha. Kalau dibaca begitu saja, kesannya kebakaran 2026 turun 83%.',
    bukti: ['2023: 1.161.192,90 ha', '2026: 202.010,96 ha'],
    sumber: [],
  },
  {
    judul: '2. Tapi periodenya tidak sama',
    isi: 'Angka 2023 adalah total setahun penuh (cocok dengan angka resmi 1,16 juta ha). Angka 2026 hampir persis sama dengan data resmi SiPongi untuk Januari–Juli 2026 (202.004,30 ha). Artinya kolom 2026 baru berisi 7 bulan, dan belum mencakup Agustus–Oktober, yang biasanya puncak musim kebakaran.',
    bukti: [
      'SiPongi: Jan–Jul 2026 = 202.004,30 ha (data rekap: 202.010,96 ha)',
      'Total resmi 2023 = 1.161.193 ha (setahun penuh)',
      'Total resmi 2025 = 359.619 ha, sedangkan kolom 2025 di rekap hanya 12.226,72 ha (juga belum setahun)',
    ],
    sumber: ['sipongi', 'kompas-okt26', 'goodstats'],
  },
  {
    judul: '3. Kalau dibandingkan periode yang sama, 2026 justru lebih luas',
    isi: 'SiPongi membandingkan periode Januari–Juli: luas 2026 naik 80% dibanding 2023, naik 47% dibanding 2019 (dua tahun El Niño besar), dan naik 69% dibanding 2025. Bahkan di dua bulan pertama saja (Jan–Feb 2026: 32.537 ha), luasnya sudah 5 kali lipat periode yang sama di 2023.',
    bukti: [
      'Jan–Jul 2026 vs 2023: +80% (+109.080 ha)',
      'Jan–Jul 2026 vs 2019: +47% (+64.997 ha)',
      'Jan–Feb 2026: 32.537 ha = 5× Jan–Feb 2023',
    ],
    sumber: ['sipongi', 'kompas-mar26'],
  },
  {
    judul: '4. Kenapa total 2023 begitu besar?',
    isi: 'Tahun 2023 adalah tahun El Niño. BMKG menyebut El Niño dan IOD positif saling menguatkan sehingga kemarau 2023 jauh lebih kering, dengan puncak Agustus–awal September. Kebakaran paling luas terjadi di provinsi bergambut dan rawan: Kalimantan Selatan, Kalimantan Tengah, Papua Selatan, dan Sumatera Selatan menyumbang 55% luas nasional 2023. El Niño secara konsisten meningkatkan risiko kebakaran, terutama di gambut yang sudah rusak.',
    bukti: [
      'El Niño + IOD positif → kemarau 2023 lebih kering (BMKG)',
      'Kalsel 190.395 ha · Kalteng 165.896 ha · Papua Selatan 150.813 ha · Sumsel 132.083 ha',
      '4 provinsi itu = 55% luas nasional 2023',
    ],
    sumber: ['bmkg-2023', 'antara-2023', 'kompas-jun26'],
  },
  {
    judul: '5. Kenapa 2026 sudah tinggi sejak awal tahun?',
    isi: 'Kemenhut menyebut suhu di atas normal (Januari–Februari 2026 terpanas ke-9 sejak 1991) dan masih banyaknya pembukaan lahan dengan cara membakar. Peneliti BRIN menyebut karhutla banyak disebabkan aktivitas manusia, sedangkan iklim memperparahnya. Setelah Juli, kebakaran meningkat lagi karena El Niño sangat kuat dan kemarau panjang. Bagian ini belum masuk ke kolom 2026 di data rekap.',
    bukti: [
      'Jan–Feb 2026 terpanas ke-9 sejak 1991',
      'Pembukaan lahan dengan membakar masih banyak',
      'Agustus–September 2026: diperparah El Niño sangat kuat',
    ],
    sumber: ['kompas-mar26', 'kompas-jun26', 'kompas-okt26'],
  },
  {
    judul: '6. Bagaimana dengan 2025?',
    isi: 'Total resmi 2025 adalah 359.619 ha, jauh di atas angka 12.226,72 ha di kolom 2025 data rekap, jadi kolom itu juga belum setahun penuh. Tahun 2025 sendiri mengalami kemarau basah (hujan di atas normal hingga Oktober), sehingga lebih rendah dari 2023. Provinsi terluas 2025 adalah NTT (sekitar 111.000 ha), yang hutannya berupa sabana dan padang rumput sehingga mudah terbakar.',
    bukti: ['Total resmi 2025 = 359.619 ha', 'Kemarau basah 2025 (BMKG)', 'NTT ≈ 111.000 ha (sabana)'],
    sumber: ['goodstats', 'kompas-2025', 'bmkg-2025'],
  },
];

export const KESIMPULAN = [
  'Data rekap tidak bisa dipakai untuk menyimpulkan karhutla 2026 lebih ringan dari 2023, karena kolom 2026 baru berisi Januari–Juli.',
  'Dibandingkan periode yang sama, 7 bulan pertama 2026 justru lebih luas daripada tahun El Niño 2019 dan 2023.',
  'Musim puncak (Agustus–Oktober) dan El Niño kuat 2026 belum masuk ke angka itu. Titik panas 17–18 November 2026 di dashboard ini (1.064 titik) menunjukkan kebakaran masih berlangsung.',
  'Rekomendasi: perbarui kolom 2026 setelah data setahun penuh keluar, selalu bandingkan periode yang sama, dan prioritaskan provinsi bergambut serta provinsi langganan kebakaran.',
];
