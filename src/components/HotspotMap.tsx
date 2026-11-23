import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, LocateFixed, Maximize2 } from 'lucide-react';
import type { HotspotRecord } from '../types/hotspot';
import { getIndonesiaRegionGeoJSON } from '../data/indonesiaGeo';
import { getConfidenceColor, getConfidenceLabelID, REGION_PRESETS } from '../utils/analytics';

interface HotspotMapProps {
  records: HotspotRecord[];
  selectedHotspot: HotspotRecord | null;
  onSelectHotspot: (record: HotspotRecord) => void;
  onFocusKabKota: (provinsi: string, kabKota: string) => void;
  isDark: boolean;
}

type MapDisplayMode = 'points' | 'clusters';
type BaseLayerMode = 'tiles' | 'vector';

export function HotspotMap({
  records,
  selectedHotspot,
  onSelectHotspot,
  onFocusKabKota,
  isDark,
}: HotspotMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vectorLayerRef = useRef<L.GeoJSON | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [displayMode, setDisplayMode] = useState<MapDisplayMode>('points');
  const [baseMode, setBaseMode] = useState<BaseLayerMode>('tiles');
  const [activePreset, setActivePreset] = useState<string>('all');

  // Precompute spatial clusters for cluster mode
  const clusters = useMemo(() => {
    const gridDeg = 0.45;
    const map = new Map<
      string,
      {
        sumLat: number;
        sumLng: number;
        total: number;
        high: number;
        medium: number;
        low: number;
        topProvinsi: string;
        topKabKota: string;
        samples: HotspotRecord[];
      }
    >();

    for (const r of records) {
      const gx = Math.floor(r.lat / gridDeg);
      const gy = Math.floor(r.lng / gridDeg);
      const key = `${gx}:${gy}`;
      let cell = map.get(key);
      if (!cell) {
        cell = {
          sumLat: 0,
          sumLng: 0,
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
          topProvinsi: r.provinsi,
          topKabKota: r.kabKota,
          samples: [],
        };
        map.set(key, cell);
      }
      cell.sumLat += r.lat;
      cell.sumLng += r.lng;
      cell.total += 1;
      if (r.confidence === 'High') cell.high += 1;
      else if (r.confidence === 'Medium') cell.medium += 1;
      else cell.low += 1;
      if (cell.samples.length < 5) cell.samples.push(r);
    }

    return Array.from(map.values()).map((c) => ({
      ...c,
      lat: c.sumLat / c.total,
      lng: c.sumLng / c.total,
    }));
  }, [records]);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-2.4, 118.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 15,
      preferCanvas: true,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.attributionControl.setPrefix(false);

    const geoLayer = L.geoJSON(getIndonesiaRegionGeoJSON(), {
      style: (feature) => {
        const isIndo =
          String(feature?.id ?? '').padStart(3, '0') === '360' ||
          feature?.properties?.name === 'Indonesia';
        return {
          fillColor: isIndo ? '#f1f5f9' : '#e2e8f0',
          fillOpacity: isIndo ? 0.92 : 0.45,
          color: isIndo ? '#94a3b8' : '#cbd5e1',
          weight: isIndo ? 1.1 : 0.6,
        };
      },
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapRef.current = map;
    vectorLayerRef.current = geoLayer;
    markersLayerRef.current = markersGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      vectorLayerRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update vector + tile layers when theme or baseMode changes
  useEffect(() => {
    const map = mapRef.current;
    const geoLayer = vectorLayerRef.current;
    if (!map || !geoLayer) return;

    geoLayer.setStyle((feature) => {
      const isIndo =
        String(feature?.id ?? '').padStart(3, '0') === '360' ||
        feature?.properties?.name === 'Indonesia';

      if (baseMode === 'tiles') {
        return {
          fillColor: isIndo ? (isDark ? '#1e293b' : '#f8fafc') : 'transparent',
          fillOpacity: isIndo ? 0.2 : 0,
          color: isIndo ? (isDark ? '#475569' : '#94a3b8') : 'transparent',
          weight: isIndo ? 0.9 : 0,
        };
      }

      return {
        fillColor: isIndo
          ? isDark
            ? '#1e293b'
            : '#ffffff'
          : isDark
            ? '#0f172a'
            : '#e2e8f0',
        fillOpacity: isIndo ? 0.95 : 0.65,
        color: isIndo
          ? isDark
            ? '#475569'
            : '#94a3b8'
          : isDark
            ? '#1e293b'
            : '#cbd5e1',
        weight: isIndo ? 1.2 : 0.7,
      };
    });

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (baseMode === 'tiles') {
      const tileUrl = isDark
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      // Carto basemap sekarang butuh API key di domain online -> pakai Esri Canvas (gratis, wajib atribusi)

      const tl = L.tileLayer(tileUrl, {
        maxZoom: 16,
        attribution: 'Peta dasar &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
      });
      tl.addTo(map);
      tl.bringToBack();
      tileLayerRef.current = tl;
    }
  }, [isDark, baseMode]);

  // Render hotspot points or clusters
  useEffect(() => {
    const map = mapRef.current;
    const group = markersLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (displayMode === 'points') {
      // Draw Low -> Medium -> High so High priority hotspots render on top
      const sorted = [...records].sort((a, b) => {
        const order = { Low: 0, Medium: 1, High: 2 };
        return order[a.confidence] - order[b.confidence];
      });

      for (const r of sorted) {
        const isSelected = selectedHotspot?.id === r.id;
        const color = getConfidenceColor(r.confidence);
        const radius = isSelected ? 9 : r.confidence === 'High' ? 6.5 : r.confidence === 'Medium' ? 4.2 : 3.5;

        const marker = L.circleMarker([r.lat, r.lng], {
          radius,
          fillColor: color,
          color: isSelected ? (isDark ? '#ffffff' : '#0f172a') : '#ffffff',
          weight: isSelected ? 2.5 : r.confidence === 'High' ? 1.2 : 0.6,
          opacity: 0.95,
          fillOpacity: r.confidence === 'High' ? 0.92 : 0.78,
        });

        const popupEl = document.createElement('div');
        popupEl.className = 'min-w-[210px] space-y-2 text-xs';
        popupEl.innerHTML = `
          <div class="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-1.5">
            <span class="font-semibold text-slate-900 dark:text-slate-100">${r.desa}</span>
            <span class="font-mono text-[11px] font-semibold" style="color:${color}">${getConfidenceLabelID(r.confidence)}</span>
          </div>
          <div class="space-y-1 text-slate-600 dark:text-slate-300">
            <div><span class="text-slate-400">Kecamatan:</span> ${r.kecamatan}</div>
            <div><span class="text-slate-400">Kab/Kota:</span> ${r.kabKota}</div>
            <div><span class="text-slate-400">Provinsi:</span> ${r.provinsi}</div>
            <div class="font-mono tabular-nums text-[11px] pt-1 text-slate-500 dark:text-slate-400">
              ${r.lat.toFixed(5)}, ${r.lng.toFixed(5)} · ${r.satelit}
            </div>
            <div class="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
              ${r.tanggal} · ${r.waktu}
            </div>
          </div>
        `;

        const btnRow = document.createElement('div');
        btnRow.className = 'pt-1 flex items-center gap-2';
        const focusBtn = document.createElement('button');
        focusBtn.type = 'button';
        focusBtn.textContent = 'Filter Kab/Kota';
        focusBtn.className =
          'px-2.5 py-1 text-[11px] font-medium rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors cursor-pointer';
        focusBtn.onclick = () => onFocusKabKota(r.provinsi, r.kabKota);

        const detailBtn = document.createElement('button');
        detailBtn.type = 'button';
        detailBtn.textContent = 'Inspeksi';
        detailBtn.className =
          'px-2.5 py-1 text-[11px] font-medium rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer';
        detailBtn.onclick = () => onSelectHotspot(r);

        btnRow.appendChild(focusBtn);
        btnRow.appendChild(detailBtn);
        popupEl.appendChild(btnRow);

        marker.bindPopup(popupEl);
        marker.on('click', () => onSelectHotspot(r));
        marker.addTo(group);
      }
    } else {
      for (const c of clusters) {
        const radius = Math.min(28, Math.max(10, 7 + Math.sqrt(c.total) * 2.6));
        const hasHigh = c.high > 0;
        const fill = hasHigh ? '#DC2626' : c.total >= 15 ? '#EA580C' : '#F59E0B';

        const icon = L.divIcon({
          className: '',
          iconSize: [radius * 2, radius * 2],
          iconAnchor: [radius, radius],
          html: `<div style="
            width:${radius * 2}px;
            height:${radius * 2}px;
            border-radius:9999px;
            background:${fill};
            opacity:0.88;
            border:2px solid rgba(255,255,255,0.9);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#ffffff;
            font-family:var(--font-mono);
            font-size:11px;
            font-weight:600;
            box-shadow:0 2px 8px rgba(15,23,42,0.28);
            cursor:pointer;
          ">${c.total}</div>`,
        });

        const marker = L.marker([c.lat, c.lng], { icon });
        marker.bindTooltip(
          `<div class="text-xs font-sans">
            <div class="font-semibold">${c.topKabKota}, ${c.topProvinsi}</div>
            <div class="font-mono tabular-nums">${c.total} titik panas (${c.high} High · ${c.medium} Med · ${c.low} Low)</div>
          </div>`,
          { direction: 'top', offset: [0, -radius] }
        );

        marker.on('click', () => {
          map.flyTo([c.lat, c.lng], Math.min(11, map.getZoom() + 3), { duration: 0.45 });
        });
        marker.addTo(group);
      }
    }
  }, [records, clusters, displayMode, selectedHotspot, isDark, onSelectHotspot, onFocusKabKota]);

  // Fly to selected hotspot if triggered from table/drawer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedHotspot) return;
    const curZoom = map.getZoom();
    if (curZoom < 8) {
      map.flyTo([selectedHotspot.lat, selectedHotspot.lng], 9, { duration: 0.5 });
    } else {
      map.panTo([selectedHotspot.lat, selectedHotspot.lng], { animate: true });
    }
  }, [selectedHotspot]);

  const handlePresetClick = (presetId: string) => {
    const preset = REGION_PRESETS.find((p) => p.id === presetId);
    if (!preset || !mapRef.current) return;
    setActivePreset(presetId);
    mapRef.current.flyTo(preset.center, preset.zoom, { duration: 0.5 });
  };

  const handleFitFiltered = () => {
    const map = mapRef.current;
    if (!map || records.length === 0) return;
    const bounds = L.latLngBounds(records.map((r) => [r.lat, r.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 10 });
    setActivePreset('custom');
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Map Header & Controls */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Peta Sebaran Titik Panas Nusantara
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-200">{records.length.toLocaleString('id-ID')}</span> titik deteksi satelit · Klik titik untuk inspeksi koordinat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Display mode toggle */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDisplayMode('points')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                displayMode === 'points'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Titik Individual
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('clusters')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                displayMode === 'clusters'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Klaster Kepadatan
            </button>
          </div>

          {/* Base layer switch */}
          <button
            type="button"
            onClick={() => setBaseMode((m) => (m === 'tiles' ? 'vector' : 'tiles'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Ubah tampilan peta dasar"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            {baseMode === 'tiles' ? 'Peta Kartografi' : 'Vektor Nusantara'}
          </button>

          {/* Fit to filtered bounds */}
          <button
            type="button"
            onClick={handleFitFiltered}
            disabled={records.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            Sesuaikan Area
          </button>
        </div>
      </div>

      {/* Quick Region Jump Bar */}
      <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 shrink-0 mr-1">
          <LocateFixed className="w-3.5 h-3.5" />
          Fokus Kawasan:
        </span>
        {REGION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePreset === preset.id
                ? 'bg-orange-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Leaflet Canvas */}
      <div className="relative h-[430px] lg:h-[490px] w-full">
        <div ref={containerRef} className="h-full w-full z-0" />

        {records.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs">
            <div className="text-center px-6 py-4">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Tidak ada titik panas pada filter aktif
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ubah atau reset filter untuk melihat sebaran titik panas di peta.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Clean Legend Footer */}
      <div className="px-5 py-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-5">
          <span className="font-medium text-slate-700 dark:text-slate-300">Tingkat Kepercayaan (Confidence):</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" aria-hidden="true" />
            Tinggi (High)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" aria-hidden="true" />
            Sedang (Medium)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" aria-hidden="true" />
            Rendah (Low)
          </span>
        </div>
        <div className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
          Rentang Koordinat: 10.21° LS – 4.29° LU · 100.44° BT – 141.01° BT
        </div>
      </div>
    </section>
  );
}
