@echo off
REM Restore do dump no MySQL 8 do Docker (evita ERROR 2026 SSL do MySQL 5.7 / DBeaver)
REM Uso: deploy\restore-dump.bat [caminho\do\arquivo.sql]

setlocal
set ROOT=%~dp0..
set DUMP=%~1
if "%DUMP%"=="" (
  if exist "%ROOT%\marlon20260804_mysql8.sql" (
    set DUMP=%ROOT%\marlon20260804_mysql8.sql
  ) else (
    set DUMP=%ROOT%\marlon20260804.sql
  )
)

if not exist "%DUMP%" (
  echo Arquivo nao encontrado: %DUMP%
  exit /b 1
)

set DB_USER=knoll
set DB_PASSWORD=knoll_change_me
set DB_NAME=knoll

if exist "%ROOT%\deploy\.env" (
  for /f "usebackq tokens=1,* delims==" %%A in (`findstr /b "DB_USER= DB_PASSWORD= DB_NAME=" "%ROOT%\deploy\.env"`) do set %%A=%%B
)

echo ==^> Restore %DUMP% -^> knoll-mysql / %DB_NAME%
echo ==^> Dica DBeaver: useSSL=false e Local client MySQL 8 + --ssl-mode=DISABLED
type "%DUMP%" | docker exec -i knoll-mysql mysql -u%DB_USER% -p%DB_PASSWORD% --ssl-mode=DISABLED %DB_NAME%
if errorlevel 1 exit /b 1

echo ==^> OK
echo Rode migrations + repair:
echo   docker exec -it knoll-backend node migrate.js
echo   docker exec -it knoll-backend node migrate.js status
echo   docker exec -it knoll-backend node migrate.js repair
endlocal
