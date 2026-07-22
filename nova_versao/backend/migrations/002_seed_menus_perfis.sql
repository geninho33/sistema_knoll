-- Seed: menus, permissões e perfil Administrador

INSERT INTO sys_perfis (id, nome, descricao, ativo)
SELECT 1, 'Administrador', 'Acesso total ao sistema', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM sys_perfis WHERE id = 1);

INSERT INTO sys_perfis (id, nome, descricao, ativo)
SELECT 2, 'Operador', 'Acesso operacional padrão', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM sys_perfis WHERE id = 2);

-- Menus principais
INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 1, 'home', 'Painel Geral', 'Dashboard', 'Home', 'home', NULL, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'home');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 2, 'clientes', 'Clientes', 'Cadastro de clientes', 'Users', 'clientes', NULL, 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'clientes');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 3, 'ordens', 'Ordens de Serviço', 'Gestão de OS', 'Wrench', 'ordens', NULL, 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'ordens');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 4, 'agenda', 'Agenda Técnica', 'Agenda de atendimentos', 'Calendar', 'agenda', NULL, 4 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'agenda');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 10, 'relatorios', 'Relatórios', 'Módulo de relatórios', 'FileBarChart', NULL, NULL, 10 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'relatorios');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 11, 'rel_clientes', 'Clientes', 'Relatório de clientes', NULL, 'rel_clientes', 10, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'rel_clientes');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 12, 'rel_servicos', 'Serviços', 'Relatório de serviços', NULL, 'rel_servicos', 10, 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'rel_servicos');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 13, 'rel_pecas', 'Peças', 'Relatório de peças', NULL, 'rel_pecas', 10, 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'rel_pecas');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 14, 'rel_produtos', 'Produtos', 'Relatório de produtos', NULL, 'rel_produtos', 10, 4 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'rel_produtos');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 20, 'admin', 'Administração', 'Módulo administrativo', 'Shield', NULL, NULL, 20 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'admin');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 21, 'admin_usuarios', 'Usuários', 'Cadastro de usuários', NULL, 'admin_usuarios', 20, 1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'admin_usuarios');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 22, 'admin_perfis', 'Perfis', 'Perfis e permissões', NULL, 'admin_perfis', 20, 2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'admin_perfis');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 23, 'admin_acessos', 'Consulta de Acessos', 'Logs de acesso', NULL, 'admin_acessos', 20, 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'admin_acessos');

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 24, 'admin_auditoria', 'Auditoria', 'Auditoria do sistema', NULL, 'admin_auditoria', 20, 4 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'admin_auditoria');

-- Permissões consulta/escrita por menu
INSERT INTO sys_permissoes (menu_id, codigo, nome, tipo)
SELECT m.id, CONCAT(m.codigo, '.consulta'), CONCAT(m.nome, ' - Consulta'), 'consulta'
FROM sys_menus m
WHERE NOT EXISTS (SELECT 1 FROM sys_permissoes p WHERE p.codigo = CONCAT(m.codigo, '.consulta'));

INSERT INTO sys_permissoes (menu_id, codigo, nome, tipo)
SELECT m.id, CONCAT(m.codigo, '.escrita'), CONCAT(m.nome, ' - Escrita'), 'escrita'
FROM sys_menus m
WHERE NOT EXISTS (SELECT 1 FROM sys_permissoes p WHERE p.codigo = CONCAT(m.codigo, '.escrita'));

-- Administrador recebe todas as permissões
INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id)
SELECT 1, p.id FROM sys_permissoes p
WHERE NOT EXISTS (
  SELECT 1 FROM sys_perfil_permissoes pp WHERE pp.perfil_id = 1 AND pp.permissao_id = p.id
);

-- Operador: menus operacionais (consulta + escrita) sem admin escrita
INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id)
SELECT 2, p.id
FROM sys_permissoes p
JOIN sys_menus m ON m.id = p.menu_id
WHERE m.codigo IN ('home','clientes','ordens','agenda','relatorios','rel_clientes','rel_servicos','rel_pecas','rel_produtos')
  AND NOT EXISTS (
    SELECT 1 FROM sys_perfil_permissoes pp WHERE pp.perfil_id = 2 AND pp.permissao_id = p.id
  );

-- Sincroniza usuários legados para sys_usuarios (perfil admin no primeiro)
INSERT INTO sys_usuarios (cd_usrs, perfil_id, email, status)
SELECT u.cd_usrs,
       CASE WHEN u.cd_usrs = 1 THEN 1 ELSE 2 END,
       u.ds_email,
       'A'
FROM knoll_usuarios u
WHERE NOT EXISTS (SELECT 1 FROM sys_usuarios s WHERE s.cd_usrs = u.cd_usrs);
