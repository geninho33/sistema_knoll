-- Menu Atendimento Técnico + permissões

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 5, 'atendimento', 'Atendimento Técnico', 'Roteiro mobile do técnico', 'MapPinned', 'atendimento', NULL, 5
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'atendimento');

INSERT INTO sys_permissoes (menu_id, codigo, nome, tipo)
SELECT m.id, CONCAT(m.codigo, '.consulta'), CONCAT(m.nome, ' - Consulta'), 'consulta'
FROM sys_menus m
WHERE m.codigo = 'atendimento'
  AND NOT EXISTS (SELECT 1 FROM sys_permissoes p WHERE p.codigo = 'atendimento.consulta');

INSERT INTO sys_permissoes (menu_id, codigo, nome, tipo)
SELECT m.id, CONCAT(m.codigo, '.escrita'), CONCAT(m.nome, ' - Escrita'), 'escrita'
FROM sys_menus m
WHERE m.codigo = 'atendimento'
  AND NOT EXISTS (SELECT 1 FROM sys_permissoes p WHERE p.codigo = 'atendimento.escrita');

-- Administrador
INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id)
SELECT 1, p.id FROM sys_permissoes p
WHERE p.codigo IN ('atendimento.consulta', 'atendimento.escrita')
  AND NOT EXISTS (
    SELECT 1 FROM sys_perfil_permissoes pp WHERE pp.perfil_id = 1 AND pp.permissao_id = p.id
  );

-- Operador
INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id)
SELECT 2, p.id FROM sys_permissoes p
WHERE p.codigo IN ('atendimento.consulta', 'atendimento.escrita')
  AND NOT EXISTS (
    SELECT 1 FROM sys_perfil_permissoes pp WHERE pp.perfil_id = 2 AND pp.permissao_id = p.id
  );
