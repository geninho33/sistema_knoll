import { useState, useEffect, useCallback } from 'react';
import {
  LogOut, Home, Wrench, Users, Calendar, BarChart3, User, Menu, X,
  FileBarChart, Shield, ChevronDown, ChevronRight, Package, Boxes, ClipboardList, KeyRound, ScrollText, History,
  MapPinned, Building2
} from 'lucide-react';
import ClientesModule from './ClientesModule';
import OrdensModule from './OrdensModule';
import AgendaTecnica from './agenda/AgendaTecnica';
import AtendimentoTecnicoMobile from './atendimento/AtendimentoTecnicoMobile';
import {
  RelatorioClientes,
  RelatorioServicos,
  RelatorioPecas,
  RelatorioProdutos,
} from './reports';
import UsuariosModule from './admin/UsuariosModule';
import PerfisModule from './admin/PerfisModule';
import { AcessosModule, AuditoriaModule } from './admin/AcessosAuditoria';
import DadosEmpresa from './admin/DadosEmpresa';
import UserMenu from './UserMenu';
import { apiFetch } from '../utils/api';

const MENU = [
  { id: 'home', label: 'Painel Geral', icon: Home },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'ordens', label: 'Ordens de Serviço', icon: Wrench },
  { id: 'agenda', label: 'Agenda Técnica', icon: Calendar },
  { id: 'atendimento', label: 'Atendimento Técnico', icon: MapPinned },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: FileBarChart,
    children: [
      { id: 'rel_clientes', label: 'Clientes', icon: Users },
      { id: 'rel_servicos', label: 'Serviços', icon: ClipboardList },
      { id: 'rel_pecas', label: 'Peças', icon: Package },
      { id: 'rel_produtos', label: 'Produtos', icon: Boxes },
    ],
  },
  {
    id: 'admin',
    label: 'Administração',
    icon: Shield,
    children: [
      { id: 'admin_usuarios', label: 'Usuários', icon: User },
      { id: 'admin_perfis', label: 'Perfis', icon: KeyRound },
      { id: 'admin_acessos', label: 'Acessos (RBAC)', icon: History },
      { id: 'admin_empresa', label: 'Dados da Empresa', icon: Building2 },
      { id: 'admin_auditoria', label: 'Auditoria', icon: ScrollText },
    ],
  },
];

function canAccess(user, moduleId) {
  if (!user) return false;
  if (user.perfilId === 1) return true;
  const perms = user.permissions || [];
  if (perms.length === 0) return true;
  return perms.includes(`${moduleId}.consulta`) || perms.includes(`${moduleId}.escrita`);
}

function NavContent({
  user,
  activeModule,
  openGroups,
  setOpenGroups,
  goTo,
  onLogout,
  onNavigate,
  empresa,
}) {
  const isChildActive = (item) => item.children?.some((c) => c.id === activeModule);
  const brand = empresa?.nm_empr || 'MARLON KNOLL';

  return (
    <>
      <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center font-bold shadow-lg ring-2 ring-slate-800 shrink-0 overflow-hidden">
          {empresa?.logo_url ? (
            <img src={empresa.logo_url} alt="" className="w-full h-full object-contain bg-white" />
          ) : (
            'MK'
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-bold tracking-wider text-sm truncate">{brand}</h1>
          <p className="text-xs text-blue-400 font-medium">Assistência Técnica</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain" aria-label="Menu principal">
        {MENU.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const groupVisible = item.children.some((c) => canAccess(user, c.id)) || canAccess(user, item.id);
            if (!groupVisible) return null;
            const open = openGroups[item.id];
            const active = isChildActive(item);
            return (
              <div key={item.id} className="pt-1">
                <button
                  type="button"
                  onClick={() => setOpenGroups((g) => ({ ...g, [item.id]: !g[item.id] }))}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-all min-h-touch ${active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/80'}`}
                  aria-expanded={open}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} aria-hidden="true" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </span>
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {open && (
                  <div className="mt-1 ml-2 space-y-1 border-l border-slate-700 pl-2">
                    {item.children.filter((c) => canAccess(user, c.id)).map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => { goTo(child.id); onNavigate?.(); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left min-h-touch ${activeModule === child.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}
                        >
                          <ChildIcon size={15} aria-hidden="true" />
                          <span className="font-medium text-sm">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (!canAccess(user, item.id) && item.id !== 'home') return null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { goTo(item.id); onNavigate?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-touch ${activeModule === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800/80'}`}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 lg:hidden safe-pb">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-red-300 hover:bg-slate-800 min-h-touch"
        >
          <LogOut size={16} /> Sair do Sistema
        </button>
      </div>
    </>
  );
}

export default function Dashboard({ user, onLogout, onUserUpdate }) {
  const [activeModule, setActiveModule] = useState('home');
  const [openGroups, setOpenGroups] = useState({ relatorios: true, admin: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const [empresa, setEmpresa] = useState(null);

  const goTo = (id) => setActiveModule(id);

  const loadEmpresa = useCallback(async () => {
    try {
      const data = await apiFetch('/configuracao/public');
      setEmpresa(data);
    } catch (_) {
      /* ignore — sessão inativa já é tratada no apiFetch */
    }
  }, []);

  useEffect(() => {
    loadEmpresa();
    const onUpdated = (e) => {
      if (e.detail) setEmpresa((prev) => ({ ...prev, ...e.detail }));
      else loadEmpresa();
    };
    window.addEventListener('knoll:empresa-updated', onUpdated);
    return () => window.removeEventListener('knoll:empresa-updated', onUpdated);
  }, [loadEmpresa]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const titles = {
    home: 'Painel Geral',
    clientes: 'Clientes',
    ordens: 'Ordens de Serviço',
    agenda: 'Agenda Técnica',
    atendimento: 'Atendimento Técnico',
    rel_clientes: 'Relatório de Clientes',
    rel_servicos: 'Relatório de Serviços',
    rel_pecas: 'Relatório de Peças',
    rel_produtos: 'Relatório de Produtos',
    admin_usuarios: 'Usuários',
    admin_perfis: 'Perfis',
    admin_acessos: 'Acessos (RBAC)',
    admin_empresa: 'Dados da Empresa',
    admin_auditoria: 'Auditoria',
  };

  const year = new Date().getFullYear();
  const brand = empresa?.nm_empr || 'Marlon Knoll';

  const renderContent = () => {
    switch (activeModule) {
      case 'home':
        return (
          <div className="animate-in fade-in duration-500">
            <div className="kpi-grid mb-6 sm:mb-8">
              <div className="card-surface p-4 sm:p-6 flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Wrench size={26} /></div>
                <div><p className="text-sm text-slate-500 font-semibold mb-0.5">O.S. Abertas</p><h3 className="text-2xl sm:text-3xl font-black text-slate-800">12</h3></div>
              </div>
              <div className="card-surface p-4 sm:p-6 flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Users size={26} /></div>
                <div><p className="text-sm text-slate-500 font-semibold mb-0.5">Clientes</p><h3 className="text-2xl sm:text-3xl font-black text-slate-800">348</h3></div>
              </div>
              <div className="card-surface p-4 sm:p-6 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0"><Calendar size={26} /></div>
                <div><p className="text-sm text-slate-500 font-semibold mb-0.5">Agenda Hoje</p><h3 className="text-2xl sm:text-3xl font-black text-slate-800">5</h3></div>
              </div>
            </div>
            <div className="card-surface p-6 sm:p-10 text-center">
              <BarChart3 size={40} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Painel Interativo</h3>
              <p className="text-slate-500 text-sm sm:text-base">Use o menu para Agenda Técnica, Atendimento Mobile, Relatórios e Administração.</p>
              <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                <button type="button" className="btn-primary" onClick={() => goTo('agenda')}>Abrir Agenda</button>
                <button type="button" className="btn-secondary" onClick={() => goTo('atendimento')}>Atendimento Mobile</button>
              </div>
            </div>
          </div>
        );
      case 'clientes':
        return <ClientesModule />;
      case 'ordens':
        return <OrdensModule />;
      case 'agenda':
        return <AgendaTecnica />;
      case 'atendimento':
        return <AtendimentoTecnicoMobile user={user} />;
      case 'rel_clientes':
        return <RelatorioClientes />;
      case 'rel_servicos':
        return <RelatorioServicos />;
      case 'rel_pecas':
        return <RelatorioPecas />;
      case 'rel_produtos':
        return <RelatorioProdutos />;
      case 'admin_usuarios':
        return <UsuariosModule />;
      case 'admin_perfis':
        return <PerfisModule />;
      case 'admin_acessos':
        return <AcessosModule />;
      case 'admin_empresa':
        return (
          <DadosEmpresa
            onEmpresaChange={(data) => setEmpresa((prev) => ({ ...prev, ...data }))}
          />
        );
      case 'admin_auditoria':
        return <AuditoriaModule />;
      default:
        return null;
    }
  };

  return (
    <div className="h-dvh bg-slate-50 flex font-sans overflow-hidden">
      {/* Desktop sidebar — fixo */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shadow-2xl z-20 shrink-0 h-dvh">
        <NavContent
          user={user}
          activeModule={activeModule}
          openGroups={openGroups}
          setOpenGroups={setOpenGroups}
          goTo={goTo}
          onLogout={onLogout}
          empresa={empresa}
        />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="drawer-overlay lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            className={`drawer-panel lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-200">Menu</span>
              <button type="button" className="btn-icon text-slate-300 hover:bg-slate-800" onClick={() => setMenuOpen(false)} aria-label="Fechar">
                <X size={22} />
              </button>
            </div>
            <NavContent
              user={user}
              activeModule={activeModule}
              openGroups={openGroups}
              setOpenGroups={setOpenGroups}
              goTo={goTo}
              onLogout={onLogout}
              onNavigate={() => setMenuOpen(false)}
              empresa={empresa}
            />
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-dvh">
        <header className="bg-white border-b border-slate-200 px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-2 shrink-0 h-14 sm:h-16 z-30 safe-pt">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="btn-icon lg:hidden text-slate-700 hover:bg-slate-100"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            {empresa?.logo_url && (
              <img
                src={empresa.logo_url}
                alt=""
                className="hidden sm:block h-8 w-auto max-w-[120px] object-contain shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-slate-800 truncate">{titles[activeModule] || 'Sistema'}</p>
              <p className="text-[11px] text-slate-400 hidden xs:block truncate lg:hidden">{brand}</p>
            </div>
          </div>

          <UserMenu user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 sm:p-5 lg:p-8 pb-4">
          {renderContent()}
        </main>

        <footer className="w-full bg-white border-t border-slate-200 py-3 px-4 sm:px-6 text-sm text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-1 shrink-0 z-10 safe-pb">
          <span className="truncate">© {year} {brand}</span>
          <span className="text-xs text-slate-400">Sistema de Assistência Técnica</span>
        </footer>
      </div>
    </div>
  );
}
