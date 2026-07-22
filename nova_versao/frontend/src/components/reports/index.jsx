import ReportModule from './ReportModule';

const formatDate = (v) => {
  if (!v || String(v).startsWith('0000')) return '-';
  try { return new Date(v).toLocaleDateString('pt-BR'); } catch { return String(v); }
};

export function RelatorioClientes() {
  return (
    <ReportModule
      title="Relatório de Clientes"
      endpoint="clientes"
      initialFilters={{ nome: '', codigo: '', bairro: '', municipio: '', telefone: '' }}
      filtersConfig={{
        defaultOrder: 'codigo',
        orderOptions: [
          { value: 'codigo', label: 'Código do cliente' },
          { value: 'nome', label: 'Nome do cliente' },
        ],
        fields: [
          { name: 'nome', label: 'Nome do cliente', placeholder: 'Buscar por nome...' },
          { name: 'codigo', label: 'Código', type: 'number', placeholder: 'ID' },
          { name: 'bairro', label: 'Bairro' },
          { name: 'municipio', label: 'Município' },
          { name: 'telefone', label: 'Telefone' },
        ],
      }}
      getColumns={(detalhado) =>
        detalhado
          ? [
              { key: 'IDCLI', label: 'Código' },
              { key: 'NOME', label: 'Nome' },
              { key: 'RAZAO', label: 'Razão Social' },
              { key: 'CPF', label: 'CPF/CNPJ', value: (r) => r.CPF || r.CGC },
              { key: 'TELEFONE', label: 'Telefone' },
              { key: 'CELULAR', label: 'Celular' },
              { key: 'EMAIL', label: 'E-mail' },
              { key: 'ENDERECO', label: 'Endereço' },
              { key: 'BAIRRO', label: 'Bairro' },
              { key: 'MUNICIPIO', label: 'Município' },
              { key: 'ESTADO', label: 'UF' },
              { key: 'CEP', label: 'CEP' },
            ]
          : [
              { key: 'IDCLI', label: 'Código' },
              { key: 'NOME', label: 'Nome' },
              { key: 'TELEFONE', label: 'Telefone', value: (r) => r.TELEFONE || r.CELULAR },
              { key: 'BAIRRO', label: 'Bairro' },
              { key: 'MUNICIPIO', label: 'Município' },
              { key: 'EMAIL', label: 'E-mail' },
            ]
      }
    />
  );
}

export function RelatorioServicos() {
  return (
    <ReportModule
      title="Relatório de Serviços"
      endpoint="servicos"
      initialFilters={{
        data_ini: '', data_fim: '', cliente: '', peca: '',
        bairro: '', municipio: '', tecnico: '', status: '', situacao: '',
      }}
      filtersConfig={{
        defaultOrder: 'data',
        orderOptions: [
          { value: 'codigo', label: 'Código do serviço' },
          { value: 'cliente', label: 'Nome do cliente' },
          { value: 'data', label: 'Data de abertura' },
          { value: 'tecnico', label: 'Técnico' },
        ],
        fields: [
          { name: 'data_ini', label: 'Data inicial', type: 'date' },
          { name: 'data_fim', label: 'Data final', type: 'date' },
          { name: 'cliente', label: 'Cliente', placeholder: 'Nome ou código' },
          { name: 'peca', label: 'Peça vinculada', placeholder: 'Descrição ou código' },
          { name: 'bairro', label: 'Bairro' },
          { name: 'municipio', label: 'Município' },
          { name: 'tecnico', label: 'Técnico responsável' },
          { name: 'status', label: 'Status do serviço', placeholder: 'Ex: Aberto, Encerrado' },
          { name: 'situacao', label: 'Situação (tipo)', placeholder: 'Ex: Garantia' },
        ],
      }}
      getColumns={(detalhado) =>
        detalhado
          ? [
              { key: 'IDSER', label: 'Nº OS' },
              { key: 'CLIENTE_NOME', label: 'Cliente' },
              { key: 'ENDERECO', label: 'Endereço', value: (r) => [r.ENDERECO, r.BAIRRO, r.MUNICIPIO].filter(Boolean).join(' - ') },
              { key: 'TECNICO_NOME', label: 'Técnico' },
              { key: 'DT_ENTR', label: 'Abertura', value: (r) => formatDate(r.DT_ENTR) },
              { key: 'DT_SADA', label: 'Conclusão', value: (r) => formatDate(r.DT_SADA) },
              { key: 'SERVICO', label: 'Serviços executados' },
              {
                key: 'pecas',
                label: 'Peças',
                value: (r) => (r.pecas || []).map((p) => `${p.DESCRICAO} (${p.QTDE})`).join(', '),
              },
              { key: 'VAL_TOT', label: 'Valor Total', value: (r) => Number(r.VAL_TOT || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
              { key: 'IN_STATUS', label: 'Status' },
              { key: 'TIPO', label: 'Situação' },
              { key: 'DEFEITO', label: 'Observações' },
            ]
          : [
              { key: 'IDSER', label: 'Nº OS' },
              { key: 'CLIENTE_NOME', label: 'Cliente' },
              { key: 'DT_ENTR', label: 'Data', value: (r) => formatDate(r.DT_ENTR) },
              { key: 'TECNICO_NOME', label: 'Técnico' },
              { key: 'IN_STATUS', label: 'Status' },
              { key: 'TIPO', label: 'Situação' },
              { key: 'VAL_TOT', label: 'Total', value: (r) => Number(r.VAL_TOT || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            ]
      }
    />
  );
}

export function RelatorioPecas() {
  return (
    <ReportModule
      title="Relatório de Peças"
      endpoint="pecas"
      initialFilters={{ codigo: '', descricao: '', categoria: '', fornecedor: '', estoque_min: '', estoque_max: '' }}
      filtersConfig={{
        defaultOrder: 'codigo',
        orderOptions: [
          { value: 'codigo', label: 'Código' },
          { value: 'descricao', label: 'Descrição' },
        ],
        fields: [
          { name: 'codigo', label: 'Código', type: 'number' },
          { name: 'descricao', label: 'Descrição' },
          { name: 'categoria', label: 'Categoria / Grupo' },
          { name: 'fornecedor', label: 'Fornecedor / Fabricante' },
          { name: 'estoque_min', label: 'Estoque mínimo (faixa)', type: 'number' },
          { name: 'estoque_max', label: 'Estoque máximo (faixa)', type: 'number' },
        ],
      }}
      getColumns={(detalhado) =>
        detalhado
          ? [
              { key: 'IDPRO', label: 'Código' },
              { key: 'DESCRICAO', label: 'Descrição' },
              { key: 'MODELO', label: 'Modelo' },
              { key: 'UNIDADE', label: 'Un.' },
              { key: 'ATUAL', label: 'Estoque' },
              { key: 'MINIMO', label: 'Mín.' },
              { key: 'MAXIMO', label: 'Máx.' },
              { key: 'CUSTO', label: 'Custo' },
              { key: 'VENDA', label: 'Venda' },
              { key: 'DS_FABR', label: 'Fabricante' },
              { key: 'DS_MARCA', label: 'Marca' },
              { key: 'GRUPO', label: 'Grupo' },
              { key: 'OBS', label: 'Obs.' },
            ]
          : [
              { key: 'IDPRO', label: 'Código' },
              { key: 'DESCRICAO', label: 'Descrição' },
              { key: 'UNIDADE', label: 'Un.' },
              { key: 'ATUAL', label: 'Estoque' },
              { key: 'MINIMO', label: 'Mín.' },
              { key: 'VENDA', label: 'Venda' },
              { key: 'DS_FABR', label: 'Fornecedor' },
            ]
      }
    />
  );
}

export function RelatorioProdutos() {
  return (
    <ReportModule
      title="Relatório de Produtos"
      endpoint="produtos"
      initialFilters={{ codigo: '', descricao: '', categoria: '', fornecedor: '', estoque_min: '', estoque_max: '', situacao: '' }}
      filtersConfig={{
        defaultOrder: 'codigo',
        orderOptions: [
          { value: 'codigo', label: 'Código' },
          { value: 'descricao', label: 'Descrição' },
        ],
        fields: [
          { name: 'codigo', label: 'Código', type: 'number' },
          { name: 'descricao', label: 'Descrição' },
          { name: 'categoria', label: 'Categoria / Grupo' },
          { name: 'fornecedor', label: 'Fornecedor / Marca' },
          { name: 'estoque_min', label: 'Estoque mínimo (faixa)', type: 'number' },
          { name: 'estoque_max', label: 'Estoque máximo (faixa)', type: 'number' },
          {
            name: 'situacao',
            label: 'Situação',
            type: 'select',
            options: [
              { value: '', label: 'Todas' },
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' },
            ],
          },
        ],
      }}
      getColumns={(detalhado) =>
        detalhado
          ? [
              { key: 'IDPRO', label: 'Código' },
              { key: 'DESCRICAO', label: 'Descrição' },
              { key: 'MODELO', label: 'Modelo' },
              { key: 'UNIDADE', label: 'Un.' },
              { key: 'ATUAL', label: 'Estoque' },
              { key: 'MINIMO', label: 'Mín.' },
              { key: 'VENDA', label: 'Venda' },
              { key: 'DS_FABR', label: 'Fornecedor' },
              { key: 'DS_MARCA', label: 'Marca' },
              { key: 'GRUPO', label: 'Grupo' },
              { key: 'ST', label: 'Situação', value: (r) => (r.ST === 'I' ? 'Inativo' : 'Ativo') },
            ]
          : [
              { key: 'IDPRO', label: 'Código' },
              { key: 'DESCRICAO', label: 'Descrição' },
              { key: 'ATUAL', label: 'Estoque' },
              { key: 'VENDA', label: 'Venda' },
              { key: 'DS_FABR', label: 'Fornecedor' },
              { key: 'DS_MARCA', label: 'Marca' },
            ]
      }
    />
  );
}
