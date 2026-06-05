@echo off
echo Iniciando servidores...

:: Inicia o backend Flask na porta 5000
start "GolpeZero - Backend" cmd /k "python main.py"

:: Inicia o servidor do frontend na porta 8000
start "GolpeZero - Frontend" cmd /c "cd src/frontend && python -m http.server 8000"

:: Aguarda 2 segundos para os servidores iniciarem
timeout /t 2 /nobreak >nul

:: Abre o navegador padrao no endereco do site
start http://localhost:8000/

echo Servidores iniciados com sucesso!
