# Projeto Faculdade - DataFlow SAP

## 📖 Sobre o Projeto

Este projeto tem como objetivo automatizar a geração de scripts de extração de dados SAP (SQL e CDS Views) a partir de requisições em linguagem natural.

A solução utiliza Inteligência Artificial, técnicas de Retrieval-Augmented Generation (RAG) e Large Language Models (LLMs) para permitir que usuários descrevam suas necessidades de negócio em linguagem natural e recebam consultas técnicas prontas para utilização.

## 🎯 Problema Resolvido

Em ambientes SAP, a extração de dados normalmente exige conhecimento técnico avançado em SQL, ABAP e estruturas internas do ERP.

Este projeto busca reduzir essa dependência técnica, aumentando a autonomia das áreas de negócio e acelerando a construção de relatórios e dashboards.

## 🚀 Funcionalidades

- Geração automática de consultas SQL

- Geração automática de CDS Views

- Interface conversacional baseada em chat

- Explicação técnica das consultas geradas

- Integração com modelos de IA

- Arquitetura preparada para RAG

- Dashboard de visualização de métricas

## 📈 Benefícios Esperados

- Redução do tempo de extração de dados

- Maior autonomia dos analistas

- Menor dependência das equipes de TI

- Aceleração na construção de dashboards

- Democratização do acesso aos dados corporativos

Estrutura inicial simples e multiplataforma para:

- Frontend em React (Vite + TypeScript + Tailwind)
- Backend em Python (FastAPI)
- Base pronta para integrar chat com IA

## 🚀 Como Rodar

📖 **[Ver instruções completas em RUN.md](./RUN.md)**

### Quick Start (Desktop Local)

**Terminal 1 — Backend:**

```bash
cd backend
pip install -r requirements.txt
c:/python314/python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Acesse:** http://localhost:5173

### Mobile (mesma rede Wi-Fi)

1. Obtenha seu IPv4: `ipconfig`
2. Execute: `npm run dev -- --host` (no frontend)
3. Acesse no celular: `http://<SEU_IP>:5173`

📚 [Detalhes completos em RUN.md](./RUN.md)

## 📁 Estrutura

```
.
├── backend/
│   ├── app/
│   │   └── main.py          # API FastAPI com endpoint /api/chat
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx      # Root + Router
│   │   │   ├── routes.ts    # Rotas
│   │   │   └── components/
│   │   │       ├── Layout.tsx
│   │   │       ├── Dashboard.tsx
│   │   │       ├── ChatInterface.tsx (integra com backend)
│   │   │       ├── Analytics.tsx
│   │   │       ├── ProjectPresentation.tsx
│   │   │       └── figma/
│   │   │           └── ImageWithFallback.tsx
│   │   └── styles/
│   │       ├── index.css
│   │       ├── tailwind.css
│   │       └── theme.css
│   ├── package.json
│   └── vite.config.js
├── RUN.md                   # Guia de execução
└── README.md
```

## ✨ Stack

| O quê      | Tecnologia                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React 19 + TypeScript + Vite                      |
| Styling    | Tailwind CSS (puro, sem 40+ UI components extras) |
| UI         | Lucide Icons                                      |
| Gráficos   | Recharts                                          |
| Backend    | Python 3.14 + FastAPI                             |
| Roteamento | React Router v7                                   |

## 🎯 Endpoints Iniciais

### Backend

- `GET /health` — Status da API
- `POST /api/chat` — Chat com IA (simulado/integré dopo)

### Frontend

- `/` — Dashboard
- `/chat` — Gerador de Scripts (chat)
- `/analytics` — Estatísticas e gráficos

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- Python 3.14+
- Node.js 20+
- npm
- Git

