export function formatDateBR(value) {
  if (!value || String(value).startsWith('0000')) return '-';
  try {
    return new Date(value).toLocaleDateString('pt-BR');
  } catch {
    return String(value);
  }
}

export function formatDateInput(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function buildAddress(item) {
  return [item.ENDERECO, item.COMPLEMENTO, item.BAIRRO, item.MUNICIPIO, item.ESTADO, item.CEP]
    .filter(Boolean)
    .join(', ');
}

export function mapsNavigateUrl(address, mode = 'google') {
  const q = encodeURIComponent(address || '');
  if (mode === 'waze') {
    return `https://waze.com/ul?q=${q}&navigate=yes`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`;
}

export function statusColor(status) {
  if (!status) return 'bg-slate-100 text-slate-700';
  if (status.includes('Aberto')) return 'bg-blue-100 text-blue-700';
  if (status.includes('Encerrado') || status.includes('Concluído')) return 'bg-emerald-100 text-emerald-700';
  if (status.includes('Aguardando')) return 'bg-amber-100 text-amber-700';
  if (status.includes('Cancelado')) return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-700';
}

export function printHtml(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Permita pop-ups para imprimir.');
    return;
  }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 12px; }
      h1 { font-size: 18px; margin: 0; }
      h2 { font-size: 14px; margin: 0 0 8px; color: #334155; }
      .header { display:flex; justify-content:space-between; gap:16px; border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:14px; }
      .box { border:1px solid #cbd5e1; border-radius:6px; padding:10px; margin-bottom:12px; }
      .label { font-size:10px; text-transform:uppercase; color:#64748b; font-weight:700; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
      table { width:100%; border-collapse:collapse; margin-top:8px; }
      th, td { border:1px solid #cbd5e1; padding:6px 8px; text-align:left; }
      th { background:#f8fafc; font-size:11px; }
      .signs { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:48px; }
      .sign { border-top:1px solid #0f172a; padding-top:6px; text-align:center; }
      .muted { color:#64748b; }
      .no-print { margin-bottom:12px; }
      @media print { .no-print { display:none !important; } }
    </style></head><body>
      <div class="no-print">
        <button onclick="window.print()">Imprimir / PDF</button>
        <button onclick="window.close()" style="margin-left:8px">Fechar</button>
      </div>
      ${bodyHtml}
      <script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
    </body></html>`);
  win.document.close();
}
