import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPinned, Navigation, Loader2, Phone, Clock, MapPin, RefreshCw
} from 'lucide-react';
import { apiFetch, buildQuery } from '../../utils/api';
import {
  buildAddress, formatDateInput, mapsNavigateUrl, statusColor
} from '../../utils/agenda';

// Ícones padrão do Leaflet quebram no bundler; usamos divIcon numerado
function numberedIcon(n) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#2563eb;color:#fff;width:28px;height:28px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch {
    return null;
  }
}

export default function AtendimentoTecnicoMobile({ user }) {
  const [tecnicos, setTecnicos] = useState([]);
  const [idfun, setIdfun] = useState('');
  const [data, setData] = useState(formatDateInput());
  const [atendimentos, setAtendimentos] = useState([]);
  const [roteiro, setRoteiro] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');
  const [points, setPoints] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    apiFetch('/agenda/tecnicos')
      .then((list) => {
        setTecnicos(list);
        // tenta casar técnico pelo nome do usuário logado
        const match = list.find((t) =>
          user?.name && String(t.NOME).toLowerCase().includes(String(user.name).split(' ')[0].toLowerCase())
        );
        setIdfun(match?.IDFUN || list[0]?.IDFUN || '');
      })
      .catch((err) => setError(err.message));
  }, [user]);

  const load = async () => {
    if (!idfun) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch(`/agenda/meu-dia${buildQuery({ data, idfun })}`);
      setAtendimentos(result.atendimentos || []);
      setRoteiro(result.roteiro || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [idfun, data]);

  // Geolocaliza endereços do roteiro (Nominatim) com delay para rate-limit
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!roteiro.length) {
        setPoints([]);
        return;
      }
      setGeoLoading(true);
      const resolved = [];
      for (const item of roteiro) {
        if (cancelled) return;
        const coords = await geocodeAddress(item.mapsQuery || item.endereco);
        resolved.push({
          ...item,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        });
        await new Promise((r) => setTimeout(r, 900));
      }
      if (!cancelled) {
        setPoints(resolved);
        setGeoLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [roteiro]);

  // Mapa Leaflet
  useEffect(() => {
    if (!mapRef.current) return undefined;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([-27.595, -48.548], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstance.current);
    }

    if (layerRef.current) {
      layerRef.current.clearLayers();
    } else {
      layerRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    const valid = points.filter((p) => p.lat != null && p.lng != null);
    const latLngs = [];
    valid.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: numberedIcon(p.ordem) })
        .bindPopup(`<strong>${p.ordem}. ${p.cliente || 'Cliente'}</strong><br/>${p.horario || ''}<br/>${p.endereco || ''}`);
      layerRef.current.addLayer(marker);
      latLngs.push([p.lat, p.lng]);
    });

    if (latLngs.length > 1) {
      const line = L.polyline(latLngs, { color: '#2563eb', weight: 4, opacity: 0.75 });
      layerRef.current.addLayer(line);
    }

    if (latLngs.length) {
      mapInstance.current.fitBounds(latLngs, { padding: [30, 30] });
    }

    setTimeout(() => mapInstance.current?.invalidateSize(), 150);

    return undefined;
  }, [points]);

  const openFullRoute = () => {
    const waypoints = points
      .filter((p) => p.lat != null)
      .map((p) => `${p.lat},${p.lng}`);
    if (!waypoints.length) {
      // fallback por endereço
      const dest = encodeURIComponent(roteiro.map((r) => r.endereco).filter(Boolean).join(' to: '));
      window.open(`https://www.google.com/maps/dir/${dest}`, '_blank');
      return;
    }
    const url = `https://www.google.com/maps/dir/${waypoints.join('/')}`;
    window.open(url, '_blank');
  };

  const tecnicoNome = useMemo(
    () => tecnicos.find((t) => Number(t.IDFUN) === Number(idfun))?.NOME || 'Técnico',
    [tecnicos, idfun]
  );

  return (
    <div className="animate-in fade-in duration-500 pb-8 space-y-4">
      <div>
        <h2 className="page-title">Atendimento Técnico</h2>
        <p className="text-sm text-slate-500 mt-1">Roteiro do dia com navegação e mapa mobile-first.</p>
      </div>

      <div className="filter-panel grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="field-label">Técnico</label>
          <select className="field-input" value={idfun} onChange={(e) => setIdfun(e.target.value)}>
            {tecnicos.map((t) => <option key={t.IDFUN} value={t.IDFUN}>{t.NOME}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Data</label>
          <input type="date" className="field-input" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <button type="button" className="btn-secondary flex-1" onClick={load}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button type="button" className="btn-primary flex-1" onClick={openFullRoute}>
            <MapPinned size={16} /> Roteiro
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      <div className="card-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
          <div>
            <p className="font-bold text-slate-800">{tecnicoNome}</p>
            <p className="text-xs text-slate-500">{atendimentos.length} atendimento(s) · {data}</p>
          </div>
          {geoLoading && <span className="text-xs text-blue-600 flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Mapas</span>}
        </div>
        <div ref={mapRef} className="w-full h-[260px] sm:h-[340px] bg-slate-100" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={36} /></div>
      ) : (
        <div className="space-y-3">
          {atendimentos.map((os, idx) => {
            const address = buildAddress(os);
            return (
              <article key={os.IDSER} className="mobile-card">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-blue-600">#{idx + 1} · OS {os.IDSER}</p>
                    <h3 className="mobile-card-title">{os.CLIENTE_NOME || `Cliente #${os.IDCLI}`}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold h-fit ${statusColor(os.IN_STATUS)}`}>
                    {os.IN_STATUS || '-'}
                  </span>
                </div>
                <p className="mobile-card-meta flex items-center gap-1"><Clock size={14} /> {os.HR_SADA || 'Horário não definido'}</p>
                <p className="mobile-card-meta flex items-start gap-1"><MapPin size={14} className="mt-0.5 shrink-0" /> {address || 'Endereço não informado'}</p>
                {(os.CELULAR || os.TELEFONE) && (
                  <a href={`tel:${os.CELULAR || os.TELEFONE}`} className="mobile-card-meta flex items-center gap-1 text-blue-700">
                    <Phone size={14} /> {os.CELULAR || os.TELEFONE}
                  </a>
                )}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    className="btn-primary w-full"
                    href={mapsNavigateUrl(address, 'google')}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation size={16} /> Como chegar (Maps)
                  </a>
                  <a
                    className="btn-secondary w-full"
                    href={mapsNavigateUrl(address, 'waze')}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Waze
                  </a>
                </div>
              </article>
            );
          })}
          {atendimentos.length === 0 && (
            <p className="card-surface p-6 text-center text-sm text-slate-500">
              Nenhum atendimento para esta data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
