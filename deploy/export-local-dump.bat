@echo off
REM Exporta dados do MySQL local (nffac617_marlon) para restore na VPS / Docker MySQL 8
REM Uso: deploy\export-local-dump.bat [arquivo_saida.sql]

setlocal EnableExtensions
set ROOT=%~dp0..
set OUT=%~1
if "%OUT%"=="" set OUT=%ROOT%\knoll_dados_local.sql

set MYSQLDUMP=
if exist "%ProgramFiles%\MySQL\MySQL Workbench 8.0 CE\mysqldump.exe" set MYSQLDUMP=%ProgramFiles%\MySQL\MySQL Workbench 8.0 CE\mysqldump.exe
if "%MYSQLDUMP%"=="" if exist "%ProgramFiles%\MySQL\MySQL Server 8.0\bin\mysqldump.exe" set MYSQLDUMP=%ProgramFiles%\MySQL\MySQL Server 8.0\bin\mysqldump.exe
if "%MYSQLDUMP%"=="" if exist "%ProgramFiles%\MySQL\MySQL Server 5.7\bin\mysqldump.exe" set MYSQLDUMP=%ProgramFiles%\MySQL\MySQL Server 5.7\bin\mysqldump.exe
if "%MYSQLDUMP%"=="" (
  echo mysqldump nao encontrado. Instale MySQL Client / Workbench.
  exit /b 1
)

set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=masterkey
set DB_NAME=nffac617_marlon
if exist "%ROOT%\nova_versao\backend\.env" (
  for /f "usebackq tokens=1,* delims==" %%A in (`findstr /b "DB_HOST= DB_USER= DB_PASSWORD= DB_NAME=" "%ROOT%\nova_versao\backend\.env"`) do set %%A=%%B
)

echo ==^> Export %DB_NAME% @ %DB_HOST% -^> %OUT%
echo ==^> Usando: %MYSQLDUMP%

"%MYSQLDUMP%" ^
  -h%DB_HOST% -u%DB_USER% -p%DB_PASSWORD% ^
  --single-transaction ^
  --quick ^
  --skip-lock-tables ^
  --add-drop-table ^
  --disable-keys ^
  --extended-insert ^
  --default-character-set=utf8mb4 ^
  --set-gtid-purged=OFF ^
  --column-statistics=0 ^
  --hex-blob ^
  %DB_NAME% ^
  knoll_clientes knoll_clientes_produtos knoll_configuracao knoll_departamento ^
  knoll_funcionario knoll_menu knoll_menu_usuario knoll_pagamento knoll_pesquisa ^
  knoll_produtos knoll_servicos knoll_servicos_itens knoll_servicos_produtos knoll_usuarios ^
  sys_acessos sys_auditoria sys_configuracoes_relatorio sys_horarios_acesso ^
  sys_logs_login sys_menus sys_perfil_permissoes sys_perfis sys_permissoes sys_usuarios ^
  > "%OUT%"

if errorlevel 1 (
  echo ERRO no mysqldump
  exit /b 1
)

for %%I in ("%OUT%") do echo ==^> OK: %%~nxI (%%~zI bytes)
echo.
echo Proximo passo na VPS:
echo   1^) Envie o arquivo: scp knoll_dados_local.sql root@SEU_IP:/root/sistema_knoll/
echo   2^) Restore:  cd /root/sistema_knoll/deploy ^&^& ./restore-dump.sh ../knoll_dados_local.sql
echo   3^) Repair:   docker exec -it knoll-backend node migrate.js repair
endlocal
