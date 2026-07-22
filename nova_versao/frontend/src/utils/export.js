function escapeCsv(value) {
  if (value == null) return '';
  const str = String(value).replace(/"/g, '""');
  return /[",;\n]/.test(str) ? `"${str}"` : str;
}

export function exportToExcel(filename, columns, rows) {
  const header = columns.map((c) => escapeCsv(c.label)).join(';');
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(typeof c.value === 'function' ? c.value(row) : row[c.key])).join(';'))
    .join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + header + '\n' + body], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPdfPrint(title, meta, tableHtml) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) {
    alert('Permita pop-ups para imprimir/exportar PDF.');
    return;
  }

  const emitido = meta?.emitido_em
    ? new Date(meta.emitido_em).toLocaleString('pt-BR')
    : new Date().toLocaleString('pt-BR');

  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 24px; font-size: 12px; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      h2 { font-size: 14px; margin: 0 0 12px; color: #334155; }
      .meta { margin-bottom: 16px; color: #475569; }
      .meta span { margin-right: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
      th { background: #f1f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: .02em; }
      .footer { margin-top: 20px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
      @media print {
        .no-print { display: none !important; }
        @page { margin: 12mm; }
      }
    </style></head><body>
      <div class="no-print" style="margin-bottom:12px">
        <button onclick="window.print()" style="padding:8px 14px;cursor:pointer">Imprimir / Salvar PDF</button>
        <button onclick="window.close()" style="padding:8px 14px;margin-left:8px;cursor:pointer">Fechar</button>
      </div>
      <h1>${meta?.empresa || 'MARLON KNOLL'}</h1>
      <h2>${title}</h2>
      <div class="meta">
        <span><strong>Emissão:</strong> ${emitido}</span>
        <span><strong>Usuário:</strong> ${meta?.usuario || '-'}</span>
        <span><strong>Tipo:</strong> ${meta?.tipo || '-'}</span>
        <span><strong>Registros:</strong> ${meta?.total ?? rowsLengthSafe(tableHtml)}</span>
      </div>
      ${tableHtml}
      <div class="footer"><span>Sistema Knoll</span><span>Página <span class="page"></span></span></div>
      <script>
        window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };
      </script>
    </body></html>`);
  win.document.close();
}

function rowsLengthSafe() {
  return '';
}

export function buildTableHtml(columns, rows) {
  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const body = rows
    .map((row) => {
      const tds = columns
        .map((c) => {
          const val = typeof c.value === 'function' ? c.value(row) : row[c.key];
          return `<td>${val == null || val === '' ? '-' : String(val)}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body || '<tr><td colspan="' + columns.length + '">Sem registros</td></tr>'}</tbody></table>`;
}
