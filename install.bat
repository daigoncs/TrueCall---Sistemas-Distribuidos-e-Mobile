@echo off
echo Instalando dependencias do TrueCall...

:: Verifica se o Python esta instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado no PATH do sistema. 
    echo Por favor, instale o Python 3 e marque a opcao "Add Python to PATH" durante a instalacao.
    pause
    exit /b %errorlevel%
)

:: Executa a instalacao dos requirements
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERRO] Ocorreu uma falha ao instalar as dependencias.
    pause
    exit /b %errorlevel%
)

echo Dependencias instaladas com sucesso!
pause
