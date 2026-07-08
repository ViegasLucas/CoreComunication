---
type: knowledge-base
category: product
title: Estratégia do MVP: Resolução de Questões Críticas (Smart Leading)
description: Documentação das definições estratégicas sobre privacidade, fluxo de dados, IA, testes e priorização para o MVP do Smart Leading.
---

# Estratégia do MVP: Resolução de Questões Críticas (Smart Leading)

Este documento consolida as decisões arquiteturais e de produto para o MVP do Smart Leading, respondendo às questões fundamentais levantadas pela diretoria (ClearIT) e pela consultoria para validação antes do desenho técnico dos componentes.

## 1. Privacidade, Acesso do RH e Risco de Sabotagem

**Desafio:** Como o RH pode ter acesso aos dados sem quebrar a privacidade? Existe risco de sabotagem?

*   **Acesso do RH (Visibilidade vs. Privacidade):** Para preservar a confiança, o RH **não terá acesso às transcrições brutas** ou detalhes sensíveis das conversas de 1:1. O acesso ao RH no MVP será feito através de um modelo híbrido focado em dados agregados e de baixo custo de desenvolvimento:
    *   **Conversational Analytics (Chat):** O RH usará um chat integrado ao Smart Agent para fazer perguntas globais (ex: *"Quais os principais temas de 1:1 na Engenharia?"*).
    *   **Exportação Segura (Backup):** Uma tela com uma tabela simples contendo dados quantitativos (Líder, Frequência, Status) com opção de **Download de CSV**. Sem dashboards complexos nesta fase.
*   **Risco de Sabotagem:** Líderes podem tentar fraudar o processo preenchendo os campos com dados genéricos (ex: "tudo ok").
    *   *Mitigação:* A IA avaliará a qualidade do input do líder no pós-reunião. Se o input for insuficiente para gerar um registro válido de acordos, a IA intervirá via chat solicitando refinamento ou sugerindo planos de ação.

## 2. Fluxo de Dados (Entrada à Saída) e UX do Líder

O ciclo de vida da informação, desde a interação do líder até a visão do RH, seguirá este fluxo, projetado para ter **Atrito Zero**:

1.  **Setup e Perfilamento:** O gestor acessa a plataforma, que identifica seu perfil e o liderado.
2.  **Input (Pré-Reunião):** O gestor insere tópicos curtos (bullet points) sobre o que deseja abordar.
3.  **Anonimização:** O sistema intercepta os dados e substitui Identificadores Pessoais (PII) por tokens (ex: `[GESTOR_1]`) para garantir conformidade com a LGPD.
4.  **Processamento (LLM):** Os dados anonimizados são enviados ao LLM para gerar o roteiro da reunião.
5.  **Re-hidratação:** O sistema recoloca os nomes reais na interface.
6.  **Condução:** A 1:1 acontece guiada pelo roteiro.
7.  **Input (Pós-Reunião - "Brain Dump"):** Em vez de formulários complexos, o líder faz anotações livres em uma **única caixa de texto** (Brain Dump). A IA lê e estrutura isso automaticamente. Se algo faltar (ex: plano de ação de um feedback crítico), o Smart Agent entra no chat e pergunta ativamente ao líder para complementar a ata.
8.  **Síntese e Acordos (LLM):** O LLM estrutura as anotações em itens de ação (Action Items).
9.  **Saída (RH):** Os dados processados alimentam o Chat do RH e a tabela de exportação de CSV.

## 3. Estratégia de Dados e Métricas Extraídas (MVP)

A plataforma extrairá insights automáticos sem exigir esforço de preenchimento. As métricas focarão em 3 pilares:

*   **Métricas de Ritmo e Adesão (Quantitativas):**
    *   Frequência de 1:1s por líder (% de líderes com reuniões em dia).
    *   Taxa de cancelamento ou reagendamento sucessivo.
*   **Métricas Temáticas e de Sentimento (Extraídas pela IA):**
    *   **Tags Temáticas:** A IA categoriza as reuniões (ex: Carreira, Alinhamento de Metas, Sobrecarga).
    *   **Sentimento e Red Flags:** Identificação de clima geral (Positivo, Alerta) e risco de atrito (*Flight Risk* / *Turnover*).
*   **Métricas de Efetividade (O Elo com o Framework SBI):**
    *   A IA conectará a detecção de feedbacks corretivos (dados no padrão SBI - Situação, Comportamento, Impacto) com a **geração obrigatória de Itens de Ação (Plano de Ação)**.
    *   O RH medirá a eficácia da liderança através da taxa de feedbacks que geraram combinados claros de mudança.

## 4. Viabilidade Financeira e Infraestrutura de IA

Respondendo a questionamentos estratégicos sobre a infraestrutura necessária e custos envolvidos para uma empresa base de 60 colaboradores:

*   **Ausência de IA Corporativa:** O produto **não requer** a contratação prévia ou instalação de uma infraestrutura robusta de "IA Corporativa" (como instâncias dedicadas na nuvem hospedadas internamente). O Smart Leading Agent utilizará integrações via API (ex: OpenAI, Anthropic) de forma *Stateless* (sem estado de memória retido fora do banco da aplicação) e com anonimização ativa (descrita no Ponto 2), eliminando o risco de exposição de dados da empresa para treinamento de modelos externos.
*   **Provável Baixo Custo para o Tipo de Uso:** A operação via API (pagamento por Token) tem custo praticamente zero para o volume de uso projetado no MVP. 
    *   *Cálculo Estimado:* Considerando 60 funcionários, 2 reuniões de 1:1 mensais por funcionário (~120 1:1s/mês). Com tarefas focadas em estruturação de texto e "Brain Dump", utilizando modelos ultra-rápidos e eficientes (ex: GPT-4o-mini ou Claude 3 Haiku), o custo total de tokens de processamento para a empresa inteira girará em torno de **US$ 1,00 a US$ 3,00 mensais**. 
    *   *Conclusão:* A relação custo-benefício (Retenção de Talentos vs. Centavos por requisição) viabiliza o projeto de forma autônoma, dispensando orçamentos complexos de TI.

## 5. Pontos de Atuação da IA no Fluxo

A Inteligência Artificial atua como um **Copiloto (Human-in-the-Loop)**:
1.  **Roteirização (Pré-Reunião):** Gera um guia de conversa adaptado à persona do líder.
2.  **Sugestão de PDI (Opcional Pré-Reunião):** Gera uma trilha de desenvolvimento estruturada com base no Framework de Levels para guiar conversas de carreira.
3.  **Tagueamento Temático (Background):** Classifica automaticamente o teor da reunião (Sentimento/Temas) para gerar inteligência de dados.
4.  **Síntese Acionável (Pós-Reunião):** Transforma anotações brutas ("Brain Dump") em um registro estruturado de acordos.

## 6. Estratégia de Testes e Validação

*   **Testes de Privacidade (Unit/Integration):** Garantir a anonimização de PII antes da chamada da API do LLM.
*   **Avaliação do LLM (Prompt Evaluation):** Medir a aderência do tom de voz e evitar alucinações.
*   **Testes End-to-End (E2E):** Validar se o fluxo do usuário (Setup -> Roteiro -> Acordos) pode ser feito em menos de 5 minutos.

## 7. Prioridade para a Próxima Fase (Desenvolvimento)

A prioridade número um para o MVP é **provar o valor da ferramenta para a Liderança, não para o RH**. Se o líder não engajar, o sistema não gera dados.

*   **Foco Estratégico:** A prioridade é validar as hipóteses de **Adesão do Líder** e **Perfilamento da IA**. O fluxo de "Preparação e Roteirização" com atrito zero deve ser desenvolvido primeiro.
*   **Dashboards e UI Complexa:** A criação de Dashboards analíticos visuais para o RH fica postergada para Releases secundários (V2+). O RH trabalhará exclusivamente via *Conversational Analytics* e exportação de CSV no MVP, comprovando a hipótese de valor com mínimo esforço de engenharia frontend.
