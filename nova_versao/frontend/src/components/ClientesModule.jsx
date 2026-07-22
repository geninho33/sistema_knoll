import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import { Pagination, LoadingBlock, EmptyState, PageHeader } from './ui/Pagination';

export default function ClientesModule() {
  const [data, setData] = useState({ data: [], totalPages: 1, page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const getInitialForm = () => ({
    NOME: '', RAZAO: '', TELEFONE: '', CELULAR: '', FAX: '',
    EMAIL: '', CEP: '', ENDERECO: '', COMPLEMENTO: '',
    BAIRRO: '', MUNICIPIO: '', ESTADO: 'SC', CPF: '',
  });

  const [formData, setFormData] = useState(getInitialForm());

  const fetchClientes = async (pageNum, query) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/clientes?page=${pageNum}&limit=10&q=${query}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchClientes(page, search), 400);
    return () => clearTimeout(delay);
  }, [page, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingClient;
    const url = isEdit
      ? `http://localhost:3001/api/clientes/${editingClient.IDCLI}`
      : 'http://localhost:3001/api/clientes';

    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setModalOpen(false);
    fetchClientes(page, search);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setFormData({
      NOME: client.NOME || '',
      RAZAO: client.RAZAO || '',
      TELEFONE: client.TELEFONE || '',
      CELULAR: client.CELULAR || '',
      FAX: client.FAX || '',
      EMAIL: client.EMAIL || '',
      CEP: client.CEP || '',
      ENDERECO: client.ENDERECO || '',
      COMPLEMENTO: client.COMPLEMENTO || '',
      BAIRRO: client.BAIRRO || '',
      MUNICIPIO: client.MUNICIPIO || '',
      ESTADO: client.ESTADO || 'SC',
      CPF: client.CPF || client.CGC || '',
    });
    setModalOpen(true);
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div className="animate-in fade-in duration-500 pb-6">
      <PageHeader
        title="Clientes"
        subtitle="Cadastro e consulta de clientes"
        actions={
          <button
            type="button"
            onClick={() => { setEditingClient(null); setFormData(getInitialForm()); setModalOpen(true); }}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        }
      />

      <div className="filter-panel mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por nome, email ou ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="field-input pl-10"
            aria-label="Buscar clientes"
          />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="cards-mobile p-3">
              {(!data.data || data.data.length === 0) && <EmptyState />}
              {data.data?.map((c) => (
                <article key={c.IDCLI} className="mobile-card">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-slate-400">#{c.IDCLI}</p>
                      <h3 className="mobile-card-title truncate">{c.NOME}</h3>
                    </div>
                    <button type="button" onClick={() => openEdit(c)} className="btn-icon text-blue-600 bg-blue-50 hover:bg-blue-100" aria-label={`Editar ${c.NOME}`}>
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <p className="mobile-card-meta">{c.TELEFONE || c.CELULAR || 'Sem telefone'}</p>
                  <p className="mobile-card-meta truncate">{c.EMAIL || 'Sem e-mail'}</p>
                </article>
              ))}
            </div>

            {/* Desktop table */}
            <div className="table-desktop overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data?.length === 0 && (
                    <tr><td colSpan="5"><EmptyState /></td></tr>
                  )}
                  {data.data?.map((c) => (
                    <tr key={c.IDCLI} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-mono text-slate-500">{c.IDCLI}</td>
                      <td className="p-4 font-semibold text-slate-800">{c.NOME}</td>
                      <td className="p-4 text-slate-600">{c.TELEFONE || c.CELULAR || '-'}</td>
                      <td className="p-4 text-slate-600">{c.EMAIL || '-'}</td>
                      <td className="p-4 text-right">
                        <button type="button" onClick={() => openEdit(c)} className="btn-icon text-blue-600 bg-blue-50 hover:bg-blue-100" aria-label="Editar">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={data.page || page}
              totalPages={data.totalPages}
              total={data.total}
              loading={loading}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary w-full sm:w-auto">Cancelar</button>
            <button type="submit" form="form-cliente" className="btn-primary w-full sm:w-auto">Salvar</button>
          </>
        }
      >
        <form id="form-cliente" onSubmit={handleSave} className="space-y-5">
          <fieldset className="p-3 sm:p-4 border border-slate-200 rounded-xl">
            <legend className="px-2 text-xs font-bold text-blue-600 uppercase">Identificação</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="cli-nome">Nome</label>
                <input id="cli-nome" required className="field-input" value={formData.NOME} onChange={set('NOME')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-razao">Razão Social</label>
                <input id="cli-razao" className="field-input" value={formData.RAZAO} onChange={set('RAZAO')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-cpf">CPF/CNPJ</label>
                <input id="cli-cpf" inputMode="numeric" className="field-input" value={formData.CPF} onChange={set('CPF')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-email">E-mail</label>
                <input id="cli-email" type="email" className="field-input" value={formData.EMAIL} onChange={set('EMAIL')} />
              </div>
            </div>
          </fieldset>

          <fieldset className="p-3 sm:p-4 border border-slate-200 rounded-xl">
            <legend className="px-2 text-xs font-bold text-blue-600 uppercase">Contato e Endereço</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="cli-tel">Telefone</label>
                <input id="cli-tel" type="tel" inputMode="tel" className="field-input" value={formData.TELEFONE} onChange={set('TELEFONE')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-cel">Celular</label>
                <input id="cli-cel" type="tel" inputMode="tel" className="field-input" value={formData.CELULAR} onChange={set('CELULAR')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-fax">Fax / Outro</label>
                <input id="cli-fax" type="tel" className="field-input" value={formData.FAX} onChange={set('FAX')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-cep">CEP</label>
                <input id="cli-cep" inputMode="numeric" className="field-input" value={formData.CEP} onChange={set('CEP')} />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="cli-end">Endereço</label>
                <input id="cli-end" className="field-input" value={formData.ENDERECO} onChange={set('ENDERECO')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-comp">Complemento</label>
                <input id="cli-comp" className="field-input" value={formData.COMPLEMENTO} onChange={set('COMPLEMENTO')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-bairro">Bairro</label>
                <input id="cli-bairro" className="field-input" value={formData.BAIRRO} onChange={set('BAIRRO')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-mun">Município</label>
                <input id="cli-mun" className="field-input" value={formData.MUNICIPIO} onChange={set('MUNICIPIO')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cli-uf">UF</label>
                <select id="cli-uf" className="field-input" value={formData.ESTADO} onChange={set('ESTADO')}>
                  <option value="SC">SC</option>
                  <option value="RS">RS</option>
                  <option value="PR">PR</option>
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                </select>
              </div>
            </div>
          </fieldset>
        </form>
      </Modal>
    </div>
  );
}
