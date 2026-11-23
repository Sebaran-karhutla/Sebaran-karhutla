import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Flame,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  Moon,
  RotateCcw,
  Search,
  Sun,
  Table2,
  X,
} from 'lucide-react';
import rawHotspots from './data/hotspots.json';
import rawSummary from './data/summary.json';
import type {
  ConfidenceLevel,
  DashboardView,
  FilterState,
  HotspotRecord,
  SatelliteType,
  SummaryRecord,
} from './types/hotspot';
import {
  aggregateByKabKota,
  aggregateByProvince,
  DEFAULT_FILTERS,
  exportHotspotsToCSV,
  filterHotspots,
} from './utils/analytics';
import { HotspotMap } from './components/HotspotMap';
import { ChartsPanel } from './components/ChartsPanel';
import { RegionalAnalysisView } from './components/RegionalAnalysisView';
import { HotspotTableView } from './components/HotspotTableView';
import { SourceDocumentView } from './components/SourceDocumentView';
import { HotspotDetailDrawer } from './components/HotspotDetailDrawer';
import { LuasKarhutlaView } from './components/LuasKarhutlaView';

const ALL_HOTSPOTS = rawHotspots as HotspotRecord[];
const ALL_SUMMARY = rawSummary as SummaryRecord[];

const NAV_ITEMS: Array<{ id: DashboardView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Ringkasan & Peta', icon: LayoutDashboard },
  { id: 'regional', label: 'Analisis Wilayah', icon: MapIcon },
  { id: 'table', label: 'Log Titik Panas', icon: Table2 },
  { id: 'luas', label: 'Luas 2023 vs 2026', icon: BarChart3 },
  { id: 'source', label: 'Rekap & PDF Asli', icon: FileSpreadsheet },
];

export default function App() {
  const [view, setView] = useState<DashboardView>('overview');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotRecord | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Unique sorted Provinces & dynamic Kab/Kota options
  const provinceOptions = useMemo(() => {
    const set = new Set(ALL_HOTSPOTS.map((r) => r.provinsi));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const kabKotaOptions = useMemo(() => {
    const scoped =
      filters.provinsi === 'ALL'
        ? ALL_HOTSPOTS
        : ALL_HOTSPOTS.filter((r) => r.provinsi === filters.provinsi);
    const set = new Set(scoped.map((r) => r.kabKota));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filters.provinsi]);

  const filteredRecords = useMemo(
    () => filterHotspots(ALL_HOTSPOTS, filters),
    [filters]
  );

  // KPI metrics derived cleanly from filteredRecords
  const kpi = useMemo(() => {
    const total = filteredRecords.length;
    const high = filteredRecords.filter((r) => r.confidence === 'High').length;
    const med = filteredRecords.filter((r) => r.confidence === 'Medium').length;
    const low = filteredRecords.filter((r) => r.confidence === 'Low').length;

    const provs = new Set(filteredRecords.map((r) => r.provinsi));
    const kabs = new Set(filteredRecords.map((r) => r.kabKota));
    const desas = new Set(filteredRecords.map((r) => `${r.kecamatan}|${r.desa}`));

    const topProv = aggregateByProvince(filteredRecords)[0] ?? null;
    const topKab = aggregateByKabKota(filteredRecords)[0] ?? null;

    return {
      total,
      shareOfAll: ((total / ALL_HOTSPOTS.length) * 100).toFixed(1),
      high,
      med,
      low,
      provCount: provs.size,
      kabCount: kabs.size,
      desaCount: desas.size,
      topProv,
      topKab,
    };
  }, [filteredRecords]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.provinsi !== 'ALL' ||
      filters.kabKota !== 'ALL' ||
      filters.satelit !== 'ALL' ||
      filters.confidence !== 'ALL' ||
      filters.tanggal !== 'ALL' ||
      filters.hourSlot !== null ||
      filters.search.trim() !== ''
    );
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleFocusKabKota = (provinsi: string, kabKota: string) => {
    setFilters((prev) => ({
      ...prev,
      provinsi,
      kabKota,
    }));
    setView('overview');
  };

  const activeViewLabel = NAV_ITEMS.find((n) => n.id === view)?.label ?? 'Ringkasan & Peta';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Wordmark */}
      <div className="h-14 px-5 flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <span className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
          <Flame className="w-4 h-4" />
        </span>
        <span className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
          Pantau Karhutla
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigasi Dashboard">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Dataset Reference Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          Cakupan Dataset PDF
        </div>
        <div className="font-mono tabular-nums">17–18 November 2026 (WIB)</div>
        <div className="font-mono tabular-nums">1.064 titik · 27 provinsi</div>
        <div>NASA-NOAA21 · NOAA20 · MODIS</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3.5 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on left, Theme + 1 Primary Action on right */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline whitespace-nowrap">
                Pantau Karhutla
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeViewLabel}
              </h1>
              {filters.provinsi !== 'ALL' && (
                <>
                  <span className="text-slate-300 dark:text-slate-700 hidden md:inline">/</span>
                  <span className="hidden md:inline text-xs font-medium text-orange-600 dark:text-orange-400 truncate">
                    {filters.provinsi}
                    {filters.kabKota !== 'ALL' ? ` · ${filters.kabKota}` : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => exportHotspotsToCSV(filteredRecords)}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 dark:bg-orange-600 text-white hover:bg-slate-800 dark:hover:bg-orange-700 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor CSV
            </button>
          </div>
        </header>

        {/* Main Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-5">
          {/* Persistent Filter Toolbar */}
          {view !== 'source' && view !== 'luas' && (
            <section
              aria-label="Filter Data Karhutla"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                {/* Search */}
                <div className="lg:col-span-4 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                    placeholder="Cari desa, kecamatan, kab/kota, koordinat..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>

                {/* Provinsi Select */}
                <div className="lg:col-span-3">
                  <select
                    value={filters.provinsi}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        provinsi: e.target.value,
                        kabKota: 'ALL',
                      }))
                    }
                    aria-label="Filter Provinsi"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  >
                    <option value="ALL">Semua Provinsi (27)</option>
                    {provinceOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kab/Kota Select */}
                <div className="lg:col-span-3">
                  <select
                    value={filters.kabKota}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, kabKota: e.target.value }))
                    }
                    aria-label="Filter Kabupaten atau Kota"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  >
                    <option value="ALL">
                      Semua Kab/Kota ({kabKotaOptions.length})
                    </option>
                    {kabKotaOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Button */}
                <div className="lg:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilters}
                    className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Filter
                  </button>
                </div>
              </div>

              {/* Segmented Controls Row: Satelit, Confidence, Tanggal */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                {/* Satelit */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Satelit:</span>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(
                      [
                        { id: 'ALL', label: 'Semua' },
                        { id: 'NASA-NOAA21', label: 'NOAA21' },
                        { id: 'NASA-NOAA20', label: 'NOAA20' },
                        { id: 'NASA-MODIS', label: 'MODIS' },
                      ] as Array<{ id: 'ALL' | SatelliteType; label: string }>
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, satelit: opt.id }))
                        }
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          filters.satelit === opt.id
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Kepercayaan:</span>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(
                      [
                        { id: 'ALL', label: 'Semua' },
                        { id: 'High', label: 'High' },
                        { id: 'Medium', label: 'Medium' },
                        { id: 'Low', label: 'Low' },
                      ] as Array<{ id: 'ALL' | ConfidenceLevel; label: string }>
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, confidence: opt.id }))
                        }
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          filters.confidence === opt.id
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tanggal */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tanggal:</span>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    {[
                      { id: 'ALL', label: 'Semua' },
                      { id: '17-11-2026', label: '17 Nov' },
                      { id: '18-11-2026', label: '18 Nov' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, tanggal: opt.id }))
                        }
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          filters.tanggal === opt.id
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filters.hourSlot && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, hourSlot: null }))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 cursor-pointer"
                  >
                    Jam: {filters.hourSlot.replace('|', ' ')}:00 WIB
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </section>
          )}

          {/* VIEW 1: OVERVIEW & MAP */}
          {view === 'overview' && (
            <>
              {/* 4-Column KPI Strip (single flat container divided by 1px borders) */}
              <section
                aria-label="Ringkasan Metrik Utama"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800"
              >
                <div className="p-5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total Titik Panas Terpantau
                  </div>
                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {kpi.total.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {kpi.shareOfAll}% dari 1.064 nasional
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Prioritas Tinggi (High Confidence)
                  </div>
                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-2xl font-display font-bold font-mono tabular-nums text-red-600 dark:text-red-400">
                      {kpi.high.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      Med: {kpi.med} · Low: {kpi.low}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Cakupan Administratif Terdampak
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-display font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {kpi.kabCount}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Kab/Kota · {kpi.provCount} Prov · {kpi.desaCount} Desa
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Episentrum Konsentrasi Tertinggi
                  </div>
                  <div className="mt-2">
                    {kpi.topKab ? (
                      <>
                        <div className="text-base font-display font-bold text-slate-900 dark:text-slate-100 truncate">
                          {kpi.topKab.kabKota}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5 truncate">
                          {kpi.topKab.provinsi} · {kpi.topKab.total} titik
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-400">—</div>
                    )}
                  </div>
                </div>
              </section>

              {/* Focal Anchor: Interactive Geospatial Map */}
              <HotspotMap
                records={filteredRecords}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={setSelectedHotspot}
                onFocusKabKota={handleFocusKabKota}
                isDark={isDark}
              />

              {/* Supporting Analytical Charts */}
              <ChartsPanel
                records={filteredRecords}
                allRecords={ALL_HOTSPOTS}
                selectedProvinsi={filters.provinsi}
                selectedHourSlot={filters.hourSlot}
                onSelectProvinsi={(prov) =>
                  setFilters((prev) => ({
                    ...prev,
                    provinsi: prov,
                    kabKota: 'ALL',
                  }))
                }
                onSelectHourSlot={(slot) =>
                  setFilters((prev) => ({ ...prev, hourSlot: slot }))
                }
              />
            </>
          )}

          {/* VIEW 2: REGIONAL DRILL-DOWN ANALYSIS */}
          {view === 'regional' && (
            <RegionalAnalysisView
              records={filteredRecords}
              allRecords={ALL_HOTSPOTS}
              onFocusKabKota={handleFocusKabKota}
              onSelectHotspot={setSelectedHotspot}
              onFilterHighConfidence={() => {
                setFilters((prev) => ({ ...prev, confidence: 'High' }));
                setView('overview');
              }}
            />
          )}

          {/* VIEW 3: DATA LOG TABLE */}
          {view === 'table' && (
            <HotspotTableView
              records={filteredRecords}
              selectedHotspotId={selectedHotspot?.id ?? null}
              onSelectHotspot={setSelectedHotspot}
            />
          )}

          {/* VIEW 5: PERBANDINGAN LUAS KARHUTLA 2023 vs 2026 */}
          {view === 'luas' && <LuasKarhutlaView />}

          {/* VIEW 4: SOURCE SUMMARY & PDF */}
          {view === 'source' && (
            <SourceDocumentView
              summaryRecords={ALL_SUMMARY}
              onFocusKabKota={handleFocusKabKota}
            />
          )}
        </main>
      </div>

      {/* Slide-over Hotspot Detail Drawer */}
      <HotspotDetailDrawer
        hotspot={selectedHotspot}
        allRecords={ALL_HOTSPOTS}
        onClose={() => setSelectedHotspot(null)}
        onSelectHotspot={setSelectedHotspot}
        onFocusKabKota={(prov, kab) => {
          setSelectedHotspot(null);
          handleFocusKabKota(prov, kab);
        }}
      />
    </div>
  );
}
