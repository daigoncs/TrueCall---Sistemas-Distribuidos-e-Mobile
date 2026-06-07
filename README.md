# TrueCall

O **TrueCall** é uma aplicação voltada para a segurança e prevenção de golpes aplicados via ligações telefônicas e engenharia social. O projeto permite que usuários verifiquem se um número de telefone é seguro (canal oficial), além de permitir que usuários autenticados gerenciem sua própria lista de números confiáveis e registrem denúncias para contribuir com a comunidade.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend (Interface)**: HTML5 semântico, CSS3 nativo e Javascript moderno (*Single Page Application* [Aplicação de Página Única] modularizada).
- **Backend (Servidor)**: Python utilizando o *framework* (estrutura de suporte ao desenvolvimento) Flask.
- **Autenticação**: JSON Web Tokens (JWT) para tráfego seguro de sessões entre frontend e backend.
- **Banco de Dados**: SQLite3 (Banco de dados relacional em arquivo local).
- **Testes**: Executados através da biblioteca padrão `unittest` do Python.

---

## ⚙️ Funcionalidades Principais

1. **Consulta Rápida Pública**: Campo de consulta na tela inicial que permite a qualquer pessoa verificar a segurança de um número instantaneamente, sem exigir cadastro ou login.
2. **Cadastro & Autenticação**: Registro de usuários com senhas criptografadas por *hashing* (algoritmo de criptografia de via única) e controle de acessos protegidos por token.
3. **Painel de Modus Operandi**: Algoritmo analítico integrado ao *dashboard* (painel de controle do usuário) que calcula dinamicamente qual tipo de golpe é mais frequente no histórico de denúncias daquele usuário e exibe alertas de segurança preventivos.
4. **Gerenciamento de Números Confiáveis**: Permite ao usuário logado cadastrar contatos telefônicos oficiais das instituições financeiras de sua preferência (ex: SAC e centrais).
5. **Máscaras de Telefone Adaptativas**: Formatação de campos de entrada em tempo real no padrão brasileiro para celulares, telefones fixos, números 0800 e centrais 4004/3003.
6. **Exportação da Blacklist**: Permite exportar toda a lista de denúncias do usuário em formato `.csv` (*Comma-Separated Values* [Valores Separados por Vírgula]) para uso em outras ferramentas ou importação em aplicativos de bloqueio locais.

---

## 🏗️ Estrutura do Projeto

```text
├── iniciar.bat                  # Script de inicialização rápida em lote para Windows
├── install.bat                  # Script de instalação de dependências do Python no Windows
├── main.py                      # Arquivo de entrada do servidor Flask
├── requirements.txt             # Dependências Python do projeto
├── src/
│   ├── backend/                 # Código do servidor lógico de processamento
│   │   ├── auth.py              # Endpoints de cadastro e login
│   │   ├── db.py                # Conexão e manutenção do banco de dados
│   │   ├── denuncias.py         # Endpoints de criação e listagem de denúncias
│   │   ├── instituicoes.py      # Endpoints de instituições e números oficiais
│   │   └── tipos_golpe.py       # Endpoints de tipagem de golpes
│   ├── database/                # Scripts SQL e banco de dados SQLite
│   │   ├── schema.sql           # Estrutura lógica das tabelas relacionais
│   │   ├── seed.sql             # Carga inicial de dados de demonstração
│   │   └── TrueCall.db          # Arquivo do banco de dados gerado
│   └── frontend/                # Interface visual em HTML, CSS e Javascript
│       ├── index.html           # Ponto de entrada HTML do app
│       ├── main.js              # Controlador principal da SPA
│       └── pages/               # Páginas modulares (login, register, dashboard, denuncias)
└── tests/                       # Suite de testes automatizados da aplicação
    ├── base.py                  # Configuração de isolamento do banco de teste
    ├── test_auth.py             # Casos de testes do fluxo de autenticação
    └── test_denuncias.py        # Casos de testes de denúncias e buscas
```

---

## 🚀 Como Executar o Projeto (Windows)

### 1. Instalação das Dependências
1. Certifique-se de ter o **Python 3** instalado em sua máquina.
2. Dê um duplo clique no arquivo **`install.bat`** na raiz do projeto para instalar automaticamente todas as dependências necessárias listadas em `requirements.txt`.

### 2. Inicialização dos Servidores
1. Dê um duplo clique no arquivo **`iniciar.bat`** na raiz do projeto.
2. O script irá:
   - Iniciar o servidor do *backend* Flask na porta `5000`.
   - Iniciar o servidor do *frontend* local na porta `8000`.
   - Abrir o seu navegador padrão automaticamente no endereço `http://localhost:8000`.

---

## 🧪 Como Executar os Testes Unitários

Os testes rodam de forma totalmente isolada em um banco de dados temporário na pasta de testes (`test_TrueCall.db`), garantindo que a base de produção não seja modificada.

Execute o comando abaixo na raiz do projeto:

```bash
python -m unittest discover -s tests
```

---

## 📐 Especificações Técnicas

Este projeto é desenvolvido seguindo boas práticas de arquitetura e engenharia de software:

- **Desenvolvimento de Aplicação Completa**: Frontend SPA desacoplado integrando-se a um servidor lógico de dados de forma assíncrona.
- **REST APIs**: Padrão de rotas estruturado sob os métodos HTTP apropriados (`GET`, `POST`, `DELETE`).
- **Banco de Dados Relacional**: Persistência de dados utilizando SQLite3 com relacionamentos chave-estrangeira e restrições de unicidade.
- **Lógica e Tratamento de Exceções**: Tratamento robusto de formulários no cliente e respostas com códigos de status HTTP corretos no servidor.
- **Versionamento de Código**: Projeto estruturado sob controle de histórico e ramos de desenvolvimento através do Git.
