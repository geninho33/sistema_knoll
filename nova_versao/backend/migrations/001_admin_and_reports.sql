-- ============================================================
-- Módulo Administração + Relatórios (Knoll Nova Versão)
-- ============================================================

-- Perfis de acesso
CREATE TABLE IF NOT EXISTS sys_perfis (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  descricao VARCHAR(255) NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_perfis_nome (nome),
  INDEX idx_perfis_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Menus do sistema (estrutura hierárquica)
CREATE TABLE IF NOT EXISTS sys_menus (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  nome VARCHAR(80) NOT NULL,
  descricao VARCHAR(200) NULL,
  icone VARCHAR(40) NULL,
  rota VARCHAR(80) NULL,
  menu_pai_id INT UNSIGNED NULL,
  ordem INT NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_menus_pai FOREIGN KEY (menu_pai_id) REFERENCES sys_menus(id) ON DELETE SET NULL,
  INDEX idx_menus_pai (menu_pai_id),
  INDEX idx_menus_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Permissões base por menu
CREATE TABLE IF NOT EXISTS sys_permissoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  menu_id INT UNSIGNED NOT NULL,
  codigo VARCHAR(80) NOT NULL UNIQUE,
  nome VARCHAR(80) NOT NULL,
  tipo ENUM('consulta','escrita') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_permissoes_menu FOREIGN KEY (menu_id) REFERENCES sys_menus(id) ON DELETE CASCADE,
  INDEX idx_permissoes_menu (menu_id),
  INDEX idx_permissoes_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ligação perfil x permissões
CREATE TABLE IF NOT EXISTS sys_perfil_permissoes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  perfil_id INT UNSIGNED NOT NULL,
  permissao_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pp_perfil FOREIGN KEY (perfil_id) REFERENCES sys_perfis(id) ON DELETE CASCADE,
  CONSTRAINT fk_pp_permissao FOREIGN KEY (permissao_id) REFERENCES sys_permissoes(id) ON DELETE CASCADE,
  UNIQUE KEY uk_perfil_permissao (perfil_id, permissao_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Extensão de usuários (liga ao knoll_usuarios legado)
CREATE TABLE IF NOT EXISTS sys_usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cd_usrs INT NOT NULL UNIQUE COMMENT 'Referência knoll_usuarios.cd_usrs',
  perfil_id INT UNSIGNED NULL,
  email VARCHAR(120) NULL,
  password_hash VARCHAR(100) NULL,
  status ENUM('A','I') NOT NULL DEFAULT 'A' COMMENT 'A=Ativo I=Inativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_sys_usuarios_perfil FOREIGN KEY (perfil_id) REFERENCES sys_perfis(id) ON DELETE SET NULL,
  INDEX idx_sys_usuarios_status (status),
  INDEX idx_sys_usuarios_perfil (perfil_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Horários de acesso por dia da semana
CREATE TABLE IF NOT EXISTS sys_horarios_acesso (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL COMMENT 'sys_usuarios.id',
  dia_semana TINYINT NOT NULL COMMENT '0=Dom .. 6=Sab',
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_horario_usuario FOREIGN KEY (usuario_id) REFERENCES sys_usuarios(id) ON DELETE CASCADE,
  INDEX idx_horario_usuario (usuario_id),
  INDEX idx_horario_dia (dia_semana),
  UNIQUE KEY uk_usuario_dia (usuario_id, dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Logs de login / consulta de acessos
CREATE TABLE IF NOT EXISTS sys_logs_login (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  login_tentativa VARCHAR(40) NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NULL,
  navegador VARCHAR(255) NULL,
  status ENUM('sucesso','falha','fora_horario') NOT NULL,
  mensagem VARCHAR(255) NULL,
  INDEX idx_logs_usuario (usuario_id),
  INDEX idx_logs_data (data_hora),
  INDEX idx_logs_ip (ip),
  INDEX idx_logs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Acessos (sessões / navegação)
CREATE TABLE IF NOT EXISTS sys_acessos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  login VARCHAR(40) NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NULL,
  navegador VARCHAR(255) NULL,
  acao VARCHAR(40) NOT NULL DEFAULT 'login',
  status ENUM('sucesso','falha','fora_horario') NOT NULL DEFAULT 'sucesso',
  detalhes VARCHAR(255) NULL,
  INDEX idx_acessos_usuario (usuario_id),
  INDEX idx_acessos_data (data_hora),
  INDEX idx_acessos_ip (ip),
  INDEX idx_acessos_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auditoria completa
CREATE TABLE IF NOT EXISTS sys_auditoria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  usuario_nome VARCHAR(80) NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tabela VARCHAR(80) NULL,
  registro_id VARCHAR(60) NULL,
  operacao ENUM('INSERT','UPDATE','DELETE','LOGIN','LOGOUT','PERMISSAO','SENHA') NOT NULL,
  valores_anteriores JSON NULL,
  valores_novos JSON NULL,
  ip VARCHAR(45) NULL,
  INDEX idx_aud_usuario (usuario_id),
  INDEX idx_aud_data (data_hora),
  INDEX idx_aud_tabela (tabela),
  INDEX idx_aud_operacao (operacao),
  INDEX idx_aud_registro (registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Preferências / configurações de relatório
CREATE TABLE IF NOT EXISTS sys_configuracoes_relatorio (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  tipo_relatorio VARCHAR(40) NOT NULL,
  nome VARCHAR(80) NOT NULL,
  filtros JSON NULL,
  ordenacao VARCHAR(40) NULL,
  formato ENUM('sintetico','detalhado') NOT NULL DEFAULT 'sintetico',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cfg_rel_usuario (usuario_id),
  INDEX idx_cfg_rel_tipo (tipo_relatorio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
