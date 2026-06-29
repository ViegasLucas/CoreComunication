# Índice Geral do Projeto — Contexto de Negócio e Produto (Smart Leading)

Bem-vindo ao **Índice Mestre** do Smart Leading. Este documento é o mapa central para encontrar as diretrizes, regras, métricas e requisitos do projeto, criado para guiar de forma rápida tanto humanos quanto a Inteligência Artificial.

## Visão Geral
O projeto **Smart Leading** é uma iniciativa da área de Recursos Humanos da **ClearIT**, uma empresa de TI fundada em 2018. 
Consiste na criação de um agente de IA focado em apoiar a liderança na preparação, condução e registro de reuniões 1:1 e feedbacks, provendo roteiros personalizados ancorados no modelo SBI. A abordagem é "Greenfield" (MVP autônomo).

---

## 🗺️ Guia de Localização Rápida (Onde encontro o quê?)

Se você precisa encontrar informações estruturais específicas para o desenvolvimento ou testes, utilize este mapa:

| O que você procura? | Arquivo de Origem |
|---------------------|-------------------|
| **Regras de Negócio (LGPD, MVP, etc)** | [Product Backlog & Requisitos](02-product/user-stories.md#3-regras-de-negócio-business-rules) |
| **Critérios de Aceite (CA)** | [Product Backlog & Requisitos](02-product/user-stories.md#4-backlog-e-histórias-de-usuário) |
| **Histórias de Usuário (Épicos)** | [Product Backlog & Requisitos](02-product/user-stories.md#4-backlog-e-histórias-de-usuário) |
| **Personas Detalhadas** | [Personas e Perfis](01-customer/personas.md) |
| **Personas (Resumo Funcional)** | [Product Backlog & Requisitos](02-product/user-stories.md#2-personas-e-públicos-alvo) |
| **Métricas e KPIs (eNPS, Liderança)** | [Métricas e Hipóteses](02-product/metrics.md) |
| **Tom de Voz e Interação da IA** | [Messaging Framework](04-operations/messaging-framework.md) |

---

## 📂 Arquitetura Completa de Contexto

Navegue abaixo por todas as dimensões da documentação de negócio:

### 👤 1. Cliente & Liderança
- [Personas e Perfis](01-customer/personas.md) - Deep-dive nos perfis de líderes (Técnico, Transição, Engajado).
- [Jornada da Liderança (1:1s e Feedback)](01-customer/journey.md) - O passo a passo do fluxo real de trabalho.
- [Voice of Customer (Dores e Resistências Internas)](01-customer/voice-of-customer.md) - Reclamações reais da operação.

### 🎯 2. Produto (MVP)
- **[Product Backlog & Requisitos (Single Source of Truth)](02-product/user-stories.md)** - O documento consolidado contendo Visão Geral, Regras de Negócio (RNs), Personas Resumidas e as Histórias de Usuário com seus Critérios de Aceite. *(Antigo PRD + User Stories)*.
- [Estratégia do Produto](02-product/strategy.md) - A tese de negócio.
- [Estratégia do MVP (Smart Leading)](02-product/smart-leading-mvp-strategy.md) - Resolução de questões críticas.
- [Product Discovery](02-product/product-discovery-smart-leading.md) - Mapa do problema e personas.
- [Métricas e Hipóteses (KPIs)](02-product/metrics.md) - Como medimos o sucesso.
- [Features: Smart Leading Agent](02-product/features/smart-leading-agent.md) - O breakdown técnico das capacidades.

### 🏢 3. Mercado e Ambiente Interno
- [Cenário Competitivo Interno](03-market/competitive-landscape.md) - Como a ClearIT se posiciona internamente.

### ⚙️ 4. Operacional
- [Processo de Adoção (Roll-out)](04-operations/adoption-process.md) - Estratégia de lançamento na empresa.
- [Messaging Framework (Tom e Linguagem)](04-operations/messaging-framework.md) - Como a IA deve falar (evitar tom RH burocrático).
- [Diretrizes de Interação da IA](04-operations/customer-communication.md) - Regras de conversação.

---

## ✅ Pendências de Validação
- Nenhuma pendência imediata. O escopo e restrições da solução (incluindo LGPD, SBI obrigatório e exclusão de PDI no MVP) estão consolidados e prontos para o desenvolvimento.
