---
type: knowledge-base
category: compliance
title: LGPD e LLMs em Projetos MVP
description: Diretrizes de compliance e proteção de dados para MVPs baseados em Large Language Models no contexto de Recursos Humanos (Smart Leading).
---

# LGPD e LLMs em Projetos MVP

Este documento consolida as diretrizes de compliance, com foco na Lei Geral de Proteção de Dados (LGPD), para o desenvolvimento de MVPs (Minimum Viable Products) que utilizam Inteligência Artificial Generativa (LLMs). O contexto primário é o projeto **Smart Leading** (Recursos Humanos).

## 1. Governança e Seleção do Provedor de LLM

A escolha do provedor fundacional de IA é o primeiro e mais crítico passo para a conformidade.

*   **APIs Corporativas (Enterprise) vs. Consumo:** Para uso corporativo, é estritamente proibido utilizar versões de consumidor (ex: ChatGPT Plus, Claude Pro web) para processar dados de colaboradores. O uso deve ser via API comercial (ex: OpenAI API, Azure OpenAI, AWS Bedrock, Google Vertex AI).
*   **Zero-Data Retention (Zero Treinamento):** O provedor escolhido deve garantir por contrato que os dados enviados nos *prompts* e gerados nos *completions* **não** serão utilizados para treinar, retreinar ou melhorar os modelos fundacionais da fornecedora.
*   **DPA (Data Processing Agreement):** É necessário estabelecer e arquivar um contrato de processamento de dados (DPA) válido com a fornecedora da LLM, avaliando seu nível de risco (Third-Party Risk Management).

## 2. Tratamento de Dados nos Prompts (Privacy by Design)

O princípio fundamental ao integrar LLMs com dados sensíveis de RH é minimizar a exposição.

*   **Minimização de Dados (Data Minimization):** Envie no *prompt* apenas o contexto estritamente necessário para que a LLM execute sua tarefa (ex: gerar um roteiro de 1:1). Evite enviar o histórico completo do funcionário se não for essencial para a interação imediata.
*   **Anonimização e Pseudonimização (Data Masking):** 
    *   **Regra de Ouro:** Dados de Identificação Pessoal (PII) direta (Nome, CPF, E-mail, Telefone) não devem, idealmente, trafegar para a API da LLM.
    *   **Implementação:** O sistema deve substituir identificadores por *tokens* (ex: `[COLABORADOR_1]`, `[LIDER_A]`) antes do envio (Sanitização) e reconstruir a resposta (Re-hidratação) na interface de usuário.

## 3. Transparência e Explicabilidade

A LGPD exige transparência sobre como e por que os dados são processados.

*   **Aviso de Uso de IA (AI Disclosure):** A interface do usuário deve deixar claro para a liderança (e outros usuários) que os roteiros, resumos ou sugestões de feedback foram gerados por ou com o auxílio de Inteligência Artificial.
*   **Human-in-the-Loop (HITL):** A IA atua **exclusivamente como um "Copiloto"**.
    *   A decisão final, a avaliação de desempenho e a condução da reunião dependem integralmente da liderança humana.
    *   Isso mitiga os riscos associados ao Artigo 20 da LGPD (direito à revisão de decisões tomadas unicamente com base em tratamento automatizado).

## 4. Bases Legais e Direitos dos Titulares

Qualquer processamento de dados requer um enquadramento jurídico adequado.

*   **Bases Legais Comuns em RH:** Para o Smart Leading, o processamento pode se basear em:
    *   *Execução de Contrato* / *Procedimentos Preliminares*: Quando atrelado à gestão regular do contrato de trabalho.
    *   *Legítimo Interesse*: Para otimização e padronização da gestão (requer LIA - Teste de Proporcionalidade).
    *   *Consentimento*: Em casos específicos onde há tratamento de dados sensíveis não estritamente ligados à execução contratual básica.
*   **Direito de Exclusão (Right to be Forgotten):** 
    *   Se um titular (colaborador) solicitar a exclusão de seus dados (ou for desligado, encerrando a base legal de retenção), o sistema deve ser capaz de expurgar as informações pessoais.
    *   Isso reforça a importância de não utilizar os dados para treinamento da LLM, pois reverter treinamento de IA com dados específicos (*machine unlearning*) é técnica e legalmente complexo.

## 5. Segurança da Informação e Ciclo de Vida (Logs)

Proteção técnica dos dados em trânsito e em repouso.

*   **Criptografia:** 
    *   **Em Trânsito:** Toda comunicação com a API da LLM deve ocorrer exclusivamente sobre protocolos seguros (TLS 1.2+ / HTTPS).
    *   **Em Repouso:** Bancos de dados e logs locais que armazenem os prompts e respostas devem ser criptografados (ex: AES-256).
*   **Retenção e Descarte de Logs (TTL):** Definir o tempo de vida (Time-to-Live) para os logs de interação com a IA. Prompts e respostas cruas não devem ser retidos indefinidamente se não houver um propósito de negócio justificável. Deve-se implementar rotinas de descarte automático.

## 6. Mitigação de Viés e Discriminação (AI Ethics)

A LGPD protege contra discriminação abusiva resultante do tratamento de dados.

*   **Riscos de Viés (Bias):** Modelos de linguagem podem refletir ou amplificar vieses (gênero, raça, idade) presentes em seus dados de treinamento. No contexto de RH, isso pode gerar sugestões de feedback prejudiciais ou discriminatórias.
*   **Guardrails em System Prompts:** A arquitetura do MVP deve incluir instruções rigorosas (System Prompts) orientando a IA a:
    *   Manter um tom profissional, neutro e focado no modelo comportamental adotado (ex: modelo SBI - *Situation, Behavior, Impact*).
    *   Basear-se estritamente em competências e entregas observáveis, rejeitando inferências sobre características protegidas do colaborador.

---
*Este documento é uma diretriz de arquitetura e compliance de produto. Dúvidas jurídicas específicas devem ser validadas com o DPO (Data Protection Officer) e o time Jurídico da organização.*
