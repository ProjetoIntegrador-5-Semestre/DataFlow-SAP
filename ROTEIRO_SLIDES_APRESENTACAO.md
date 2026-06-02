# Roteiro de Slides - Apresentacao da Banca

## Slide 1 - Capa

- Titulo: SAP Script AI
- Subtitulo: Criacao automatizada de scripts para visualizacao de dados SAP
- Integrantes, curso, disciplina, data

## Slide 2 - Contexto e problema

- Dificuldade de traduzir perguntas de negocio em consultas SAP
- Dependencia de especialistas tecnicos
- Impacto em tempo, autonomia e tomada de decisao

## Slide 3 - Objetivo do projeto

- Gerar scripts tecnicos a partir de linguagem natural
- Suportar multiplos formatos: SQL, ABAP CDS, JSON, Power Query (M)
- Persistir historico e indicadores de uso por usuario

## Slide 4 - Solucao proposta

- Interface de chat para perguntas em linguagem natural
- Backend com IA para geracao de scripts (OpenAI-compatible + fallback local)
- Banco de dados para historico, metricas e rastreabilidade
- PWA instalavel como app no celular

## Slide 5 - Arquitetura

- Frontend: React 19 + TypeScript + Vite + Tailwind
- Backend: Python 3.14 + FastAPI
- Banco: SQLite com migracao automatica
- Servico de IA: OpenAI-compatible com fallback sem chave
- Fluxo: usuario -> API (JWT) -> IA -> banco -> dashboard por usuario

## Slide 6 - O que foi construido: Sprint 1

- Estrutura base do projeto (frontend + backend)
- Autenticacao completa: registro, login, JWT + bcrypt
- Banco SQLite com tabelas users, chat_messages, generated_scripts
- Endpoints de auth operacionais

## Slide 7 - O que foi construido: Sprint 2

- Interface de chat com envio de perguntas e geracao de scripts
- Suporte a 4 formatos de saida (SQL, ABAP, JSON, Power BI M)
- Historico de conversa persistido no banco
- Scripts vinculados ao usuario (rastreabilidade)

## Slide 8 - O que foi construido: Sprint 3

- Dashboard com metricas exclusivas por usuario (scripts gerados, tempo economizado, taxa de sucesso)
- Scripts recentes filtrados por usuario
- Pagina de Analytics com graficos (uso por dia, por formato, tempo economizado por mes)
- Loading visual no chat (indicador de digitacao)

## Slide 9 - O que foi construido: Sprint 4

- Exportacao de scripts como arquivo (.sql, .abap, .pq, .json)
- Exportacao de conversa completa como PDF
- Exportacao de relatorio do dashboard como PDF
- PWA: manifesto, service worker, instalavel na home screen

## Slide 10 - Banco de dados

- Tabela users: id, email, senha bcrypt, nome
- Tabela chat_messages: conversation_id, role, content, created_at
- Tabela generated_scripts: user_id, question, format, script, language, created_at
- Rastreabilidade: quem perguntou, o que foi gerado, quando

## Slide 11 - IA e geracao de queries

- Prompt orientado para contexto SAP (tabelas MSEG, MARC, VBRK, EKKO, etc)
- Formatos de saida configurados pelo usuario antes de enviar
- Fallback local garante funcionamento sem chave de API
- Servico mock SAP simula estrutura de dados reais

## Slide 12 - Demo (ao vivo)

- Cadastro de novo usuario
- Login e redirecionamento para dashboard zerado
- Envio de pergunta no chat
- Script gerado com loading visual
- Exportar script como arquivo
- Dashboard atualizado com os dados do usuario
- Exportar relatorio PDF

## Slide 13 - Gaps e proximos passos

- Sem conector SAP real: proximo passo natural apos validacao academica
- SQLite adequado para o escopo atual; PostgreSQL para producao
- RBAC e auditoria avancada como evolucao de governanca
- Observabilidade (logs, tracing) para ambiente corporativo

## Slide 14 - Conclusao

- Projeto entrega fluxo completo ponta a ponta operacional
- Cada usuario tem seu proprio historico, metricas e exportacoes
- Demonstra viabilidade real de IA aplicada ao contexto SAP
- Base solida e pronta para evoluir com conector SAP real

aa
