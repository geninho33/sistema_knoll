-- Extensão da configuração da empresa (logo, IE, observações)
-- Colunas adicionadas via migrate helper se não existirem

INSERT INTO sys_menus (id, codigo, nome, descricao, icone, rota, menu_pai_id, ordem)
SELECT 25, 'admin_empresa', 'Dados da Empresa', 'Configuração cadastral e logotipo', 'Building2', 'admin_empresa', 20, 5
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE codigo = 'admin_empresa');

INSERT INTO sys_permissoes (menu_id, codigo, nome, tipo)
SELECT m.id, CONCAT(m.codigo, '.consulta'), CONCAT(m.nome, ' - Consulta'), 'consulta'
FROM sys_menus m
WHERE m.codigo = 'admin_empresa'
  AND NOT EXISTS (SELECT 1 FROM sys_permissoes p WHERE p.codigo = 'admin_empresa.consulta');

INSERT INTO sys_permissoes (menu_id, codigo, nome, tipo)
SELECT m.id, CONCAT(m.codigo, '.escrita'), CONCAT(m.nome, ' - Escrita'), 'escrita'
FROM sys_menus m
WHERE m.codigo = 'admin_empresa'
  AND NOT EXISTS (SELECT 1 FROM sys_permissoes p WHERE p.codigo = 'admin_empresa.escrita');

INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id)
SELECT 1, p.id FROM sys_permissoes p
WHERE p.codigo IN ('admin_empresa.consulta', 'admin_empresa.escrita')
  AND NOT EXISTS (
    SELECT 1 FROM sys_perfil_permissoes pp WHERE pp.perfil_id = 1 AND pp.permissao_id = p.id
  );

INSERT INTO sys_perfil_permissoes (perfil_id, permissao_id)
SELECT 2, p.id FROM sys_permissoes p
WHERE p.codigo = 'admin_empresa.consulta'
  AND NOT EXISTS (
    SELECT 1 FROM sys_perfil_permissoes pp WHERE pp.perfil_id = 2 AND pp.permissao_id = p.id
  );
