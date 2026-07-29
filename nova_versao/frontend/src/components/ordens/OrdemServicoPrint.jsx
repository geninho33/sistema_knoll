import { Printer, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { apiFetch } from '../../utils/api';
import { buildAddress, formatDateBR, printHtml } from '../../utils/agenda';
import { calcTotaisOS, formatMoney, toNumber } from '../../utils/money';

function esc(value) {
  if (value == null || value === '') return '';
  return String(value);
}

function formatDt(value) {
  if (!value || String(value).startsWith('0000')) return '-';
  try {
    return new Date(value).toLocaleDateString('pt-BR');
  } catch (_err) {
    return '-';
  }
}

export async function imprimirOrdemServico(idser) {
  const detail = await apiFetch('/agenda/os/' + idser);
  const os = detail.os || {};
  const empresa = detail.empresa || {};
  const itens = detail.itens || [];
  const equipamentos = detail.equipamentos || [];
  const totais = detail.totais || calcTotaisOS(os, itens);

  const itensRows = itens.map(function (i) {
    const uni = toNumber(i.VAL_UNI);
    const tot = toNumber(i.VAL_TOT != null ? i.VAL_TOT : uni * toNumber(i.QTDE));
    return [
      '<tr>',
      '<td>' + esc(i.IDPRO || '-') + '</td>',
      '<td>' + esc(i.DESCRICAO || '-') + '</td>',
      '<td>' + esc(i.UNIDADE || '-') + '</td>',
      '<td style="text-align:right">' + esc(i.QTDE != null ? i.QTDE : '-') + '</td>',
      '<td style="text-align:right">' + formatMoney(uni) + '</td>',
      '<td style="text-align:right">' + formatMoney(tot) + '</td>',
      '</tr>',
    ].join('');
  }).join('');

  const eqRows = equipamentos.map(function (eq) {
    return [
      '<tr>',
      '<td>' + esc(eq.DS_EQPM || '-') + '</td>',
      '<td>' + esc(eq.NM_MARC || '-') + '</td>',
      '<td>' + esc(eq.DS_MODL || '-') + '</td>',
      '<td>' + esc(eq.DS_SERI || eq.NM_SERIE || '-') + '</td>',
      '<td>' + esc(eq.NU_NOTA || '-') + '</td>',
      '<td>' + formatDt(eq.DT_EMSS) + '</td>',
      '<td>' + esc(eq.DEFEITO || '-') + '</td>',
      '</tr>',
    ].join('');
  }).join('');

  const equipamentoResumo = os.EQUIPAMENTO_NOME
    || equipamentos
      .map(function (eq) {
        return [eq.DS_EQPM, eq.NM_MARC, eq.DS_MODL].filter(Boolean).join(' · ');
      })
      .filter(Boolean)
      .join('; ')
    || '-';

  const defeitoResumo = os.DEFEITO
    || os.EQUIPAMENTO_DEFEITO
    || equipamentos.map(function (eq) { return eq.DEFEITO; }).filter(Boolean).join(' | ')
    || '-';

  const situacaoGarantia = os.EQUIPAMENTO || '-';

  let logoHtml = '';
  if (empresa.logo_url) {
    const logoSrc = empresa.logo_url.startsWith('http')
      ? empresa.logo_url
      : (window.location.origin + empresa.logo_url);
    logoHtml = '<img src="' + logoSrc + '" alt="Logo" style="max-height:64px;max-width:120px;object-fit:contain" />';
  }

  const cnpjHtml = empresa.nu_cnpj ? ('CNPJ: ' + empresa.nu_cnpj) : '';
  const telHtml = empresa.nu_telf ? (' · Tel: ' + empresa.nu_telf) : '';
  const enderecoEmpresa = [empresa.nm_logr, empresa.nm_barr, empresa.nm_munc, empresa.sg_estd]
    .filter(Boolean)
    .join(', ');

  let equipamentosHtml = '<div><strong>' + esc(equipamentoResumo) + '</strong></div>';
  if (equipamentos.length) {
    equipamentosHtml = [
      '<table>',
      '<thead><tr>',
      '<th>Produto</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>Nf</th><th>Data</th><th>Situacao / Defeito</th>',
      '</tr></thead>',
      '<tbody>' + eqRows + '</tbody>',
      '</table>',
    ].join('');
  }

  const itensBody = itensRows || '<tr><td colspan="6">Nenhuma peça lançada.</td></tr>';
  const emitidoEm = new Date().toLocaleString('pt-BR');

  const body = [
    '<div class="header">',
    '<div style="display:flex;gap:12px;align-items:flex-start">',
    logoHtml,
    '<div>',
    '<h1>' + esc(empresa.nm_empr || empresa.ds_razao || 'MARLON KNOLL') + '</h1>',
    '<p class="muted">' + esc(empresa.ds_razao || 'Assistência Técnica') + '</p>',
    '<p class="muted">' + cnpjHtml + telHtml + '</p>',
    '<p class="muted">' + esc(enderecoEmpresa) + '</p>',
    '</div></div>',
    '<div style="text-align:right">',
    '<h2 style="font-size:20px;color:#0f172a">ORDEM DE SERVIÇO</h2>',
    '<p style="font-size:22px;font-weight:800;margin:4px 0">Nº ' + esc(os.IDSER) + '</p>',
    '<p class="muted">Emissão: ' + emitidoEm + '</p>',
    '</div></div>',

    '<div class="box"><div class="grid">',
    '<div><div class="label">Cliente</div>',
    '<div><strong>' + esc(os.CLIENTE_NOME || '-') + '</strong></div>',
    '<div class="muted">Código: ' + esc(os.IDCLI || '-') + '</div>',
    '<div class="muted">' + esc(os.CELULAR || os.TELEFONE || '') + '</div></div>',
    '<div><div class="label">Endereço de atendimento</div>',
    '<div>' + esc(buildAddress(os) || '-') + '</div></div>',
    '<div><div class="label">Técnico responsável</div>',
    '<div><strong>' + esc(os.TECNICO_NOME || '-') + '</strong></div></div>',
    '<div><div class="label">Agendamento</div>',
    '<div>' + formatDateBR(os.DT_SADA) + ' ' + esc(os.HR_SADA || '') + '</div>',
    '<div class="muted">Status: ' + esc(os.IN_STATUS || '-') +
      ' · Tipo: ' + esc(os.TIPO || '-') +
      ' · ' + esc(situacaoGarantia) + '</div></div>',
    '</div></div>',

    '<div class="box">',
    '<div class="label">Equipamento / Produto</div>',
    equipamentosHtml,
    '<div class="label" style="margin-top:10px">Problema / Defeito relatado</div>',
    '<div>' + esc(defeitoResumo) + '</div>',
    '<div class="label" style="margin-top:8px">Serviços a executar / Observações técnicas</div>',
    '<div>' + esc(os.SERVICO || '-') + '</div>',
    '</div>',

    '<div class="box">',
    '<div class="label">Peças e materiais</div>',
    '<table><thead><tr>',
    '<th>Código</th><th>Descrição</th><th>Un.</th><th>Qtde</th><th>Unitário</th><th>Total</th>',
    '</tr></thead><tbody>',
    itensBody,
    '</tbody></table></div>',

    '<div class="box"><div class="grid">',
    '<div><span class="label">Valor serviço</span><div>' + formatMoney(totais.VAL_SER) + '</div></div>',
    '<div><span class="label">Valor produtos</span><div>' + formatMoney(totais.VAL_PRO) + '</div></div>',
    '<div><span class="label">Desconto</span><div>' + formatMoney(totais.VAL_DES) + '</div></div>',
    '<div><span class="label">Total</span><div style="font-size:16px;font-weight:800">' +
      formatMoney(totais.VAL_TOT) + '</div></div>',
    '</div></div>',

    '<div class="signs">',
    '<div class="sign">Assinatura do Cliente<br/><span class="muted">Nome / Documento</span></div>',
    '<div class="sign">Assinatura do Técnico<br/><span class="muted">' +
      esc(os.TECNICO_NOME || 'Técnico responsável') + '</span></div>',
    '</div>',
  ].join('');

  printHtml('OS #' + os.IDSER, body);
}

export function BotaoImprimirOS({ idser, className = '' }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!idser) return;
    setLoading(true);
    try {
      await imprimirOrdemServico(idser);
    } catch (err) {
      alert(err.message || 'Falha ao gerar impressão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || !idser}
      className={'btn-secondary ' + className}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
      Imprimir OS
    </button>
  );
}
