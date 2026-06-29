---
type: knowledge-base
category: product
title: Estratégia do MVP: Resolução de Questões Críticas (Smart Leading)
description: Documentação das definições estratégicas sobre privacidade, fluxo de dados, IA, testes e priorização para o MVP do Smart Leading.
---

# Estratégia do MVP: Resolução de Questões Críticas (Smart Leading)

Este documento consolida as decisões arquiteturais e de produto para o MVP do Smart Leading, respondendo às cinco questões fundamentais levantadas pela diretoria (ClearIT) para validação antes do desenho técnico dos componentes.

## 1. Privacidade, Acesso do RH e Risco de Sabotagem

**Desafio:** Como o RH pode ter acesso aos dados sem quebrar a privacidade? Existe risco de sabotagem?

*   **Acesso do RH (Visibilidade vs. Privacidade):** Para preservar a confiança, o RH **não terá acesso às transcrições brutas** ou detalhes sensíveis das conversas de 1:1. O acesso do RH será restrito a **Metadados e Dashboards Agregados**.
    *   *O que o RH vê:* Taxa de adesão (quem faz 1:1 e com qual frequência), categorização de temas (ex: % de conversas sobre carreira vs. feedback corretivo) e o status de evolução dos acordos táticos (andamento vs. estagnado).
*   **Risco de Sabotagem:** Líderes (especialmente o Perfil Técnico) podem tentar fraudar o processo preenchendo os campos com dados genéricos (ex: "tudo ok") apenas para cumprir a métrica do RH.
    *   *Mitigação:* A IA avaliará a qualidade do input do líder no pós-reunião. Se o input for insuficiente para gerar um registro válido de acordos, a IA intervirá de forma empática solicitando refinamento ou sugerindo opções de "clique-rápido" baseadas no roteiro sugerido, reduzindo a fricção e dificultando o "bypass" do sistema.

## 2. Fluxo de Dados (Entrada à Saída)

O ciclo de vida da informação, desde a interação do líder até a visão do RH, seguirá este fluxo:

1.  **Setup e Perfilamento:** O gestor acessa a plataforma, que identifica seu perfil de liderança e o liderado selecionado para a 1:1.
2.  **Input (Pré-Reunião):** O gestor insere tópicos curtos (bullet points) sobre o que deseja abordar.
3.  **Anonimização:** O sistema intercepta os dados e substitui Identificadores Pessoais (PII) por tokens (ex: `[GESTOR_1]`, `[LIDERADO_A]`) para garantir conformidade com a LGPD (Minimização de Dados).
4.  **Processamento (LLM):** Os dados anonimizados e o histórico são enviados ao LLM para gerar o roteiro da reunião adaptado ao tom do gestor.
5.  **Re-hidratação:** O sistema recebe o roteiro e recoloca os nomes reais para a visualização do gestor.
6.  **Condução:** A 1:1 acontece guiada pelo roteiro.
7.  **Input (Pós-Reunião):** O gestor faz anotações rápidas sobre o resultado e os combinados (via texto ou voz/Whisper).
8.  **Síntese e Acordos (LLM):** O LLM estrutura as anotações em itens de ação claros e consolida os acordos táticos.
9.  **Saída (RH):** Os dados são salvos no banco. Uma camada analítica extrai apenas as categorias temáticas e métricas de uso para o Dashboard do RH.

## 3. Pontos de Atuação da IA no Fluxo

A Inteligência Artificial (LLM) atua como um **Copiloto (Human-in-the-Loop)** em três etapas distintas:

1.  **Roteirização e Adequação de Tom (Pré-Reunião):** Cruza o histórico de 1:1s anteriores com os tópicos atuais e gera um guia de conversa adaptado à persona do líder (ex: mais direto para líderes técnicos; mais empático e passo-a-passo para líderes em transição).
2.  **Tagueamento Temático (Processamento Background):** Classifica automaticamente o teor da reunião (ex: Engajamento, Performance, Conflito) para gerar inteligência de dados para o RH sem expor o texto original.
3.  **Síntese Acionável (Pós-Reunião):** Transforma os "rabiscos" ou gravações brutas do gestor em um registro estruturado de acordos, resolvendo a dor de combinados genéricos e estagnados.

## 4. Estratégia de Testes, Ferramentas e Dados

A validação deste sistema requer uma abordagem focada em qualidade de prompt, segurança de dados e usabilidade.

*   **Testes de Privacidade e Segurança (Unit/Integration):**
    *   *Objetivo:* Garantir a anonimização. Validar se a camada de tokenização impede o envio de CPFs e Nomes para a API do LLM.
    *   *Ferramentas:* Jest / Vitest.
*   **Avaliação do LLM (Prompt Evaluation):**
    *   *Objetivo:* Medir a aderência do tom de voz, mitigação de viés (Bias) e evitar alucinações, assegurando o uso de modelos comportamentais (ex: Feedback SBI).
    *   *Dados:* Datasets de validação (exemplos de "entradas reais" e "saídas ideais").
    *   *Ferramentas:* LangSmith (ou similar) para tracking de prompts e logs.
*   **Testes End-to-End (E2E):**
    *   *Objetivo:* Validar a métrica central de sucesso: o fluxo do usuário (Setup -> Roteiro -> Acordos) pode ser feito em **menos de 5 minutos**?
    *   *Ferramentas:* Playwright ou Cypress.
    *   *Dados:* Massa de dados *mockada* simulando diferentes líderes e históricos.

## 5. Prioridade para a Próxima Fase (Desenvolvimento e Validação)

Considerando o mapa do problema, a prioridade número um para o MVP é **provar o valor da ferramenta para a Liderança, não para o RH**. Se o líder não engajar, o sistema não gera dados para análise.

*   **Foco Estratégico (Vertical Slice):** A prioridade é desenvolver e validar as hipóteses **H1 (Adesão do Líder Técnico)** e **H5 (Perfilamento da IA)**.
*   **O que será construído:** O fluxo de "Preparação e Roteirização" (Pré-1:1). O sistema deve ser capaz de receber tópicos simples, anonimizar, processar o tom correto via LLM e entregar um roteiro que reduza o tempo de preparo do gestor para menos de 5 minutos.
*   **O que será deixado para depois:** Dashboards complexos para o RH e a funcionalidade de gravação de voz (Whisper) podem entrar em releases secundários, após a validação do engajamento inicial através de inputs de texto.
