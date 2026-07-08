# Product Backlog & Requisitos: Smart Leading (MVP)

Este documento atua como a única fonte da verdade (Single Source of Truth) para o desenvolvimento do **Smart Leading**, consolidando a Estratégia do Produto, Regras de Negócio e o Backlog (Histórias de Usuário) extraídos da fase de Discovery.

---

## 1. Visão Geral e Objetivos (POR QUE e O QUE)

### O Problema
Atualmente, as lideranças da ClearIT possuem uma execução fragmentada de reuniões de 1:1 e feedbacks. A falta de preparo e o baixo repertório emocional para lidar com conversas difíceis geram um desgaste nas relações. Além disso, os registros dessas interações são descentralizados (Word, Excel, Sólides) ou inexistentes, criando um "ponto cego analítico" para o RH, o que resultou em queda nos indicadores de Liderança e Confiança e no eNPS.

### A Solução
Um agente inteligente que atua *antes* da conversa, provendo roteiros de 1:1 e feedbacks estruturados e personalizados baseados no contexto, no modelo SBI (Situação, Comportamento e Impacto) e no Framework de Levels da empresa.

### Métricas de Sucesso
- Aumento da frequência de 1:1s e adoção orgânica por parte dos líderes.
- Recuperação qualitativa dos indicadores de **eNPS** e **Índice de Liderança e Confiança**.
- Início da estruturação de dados qualitativos das reuniões, pavimentando a futura visão de governança (v2).

---

## 2. Personas e Públicos-Alvo

A ferramenta deve atender a três perfis distintos de líderes, adaptando a experiência para gerar engajamento:

1. **Líder Técnico:** Rejeita burocracia e jargões. Precisa de uma ferramenta que entregue um roteiro objetivo e prático em menos de 5 minutos, orientado a fatos.
2. **Líder em Transição:** Tem vontade, mas falta repertório emocional. Precisa de apoio passo a passo, validação e roteiros mais humanizados que ensinem a separar o comportamento da pessoa.
3. **Líder Engajado:** Já acredita no processo, mas não tem tempo. Precisa de eficiência, organização e da capacidade de resgatar históricos anteriores rapidamente.

---

## 3. Regras de Negócio (Business Rules)

Essas restrições são inegociáveis e guiam a arquitetura da solução:

- **RN01 - Bloqueio de Dados Sensíveis (LGPD):** É proibido inserir dados pessoais sensíveis (Nomes completos, CPFs, diagnósticos de saúde, processos disciplinares) no contexto. O sistema deve barrar ou anonimizar automaticamente tais dados.
- **RN02 - Princípio Human-in-the-Loop:** A IA atua apenas como copiloto de preparação. O gestor humano é o único responsável pelas decisões, avaliação e pelo tom final aplicado durante a reunião presencial/remota.
- **RN03 - Isolamento do MVP (Abordagem Greenfield):** A solução funcionará de forma autônoma. Não haverá integração de leitura ou escrita com a plataforma Sólides, planilhas ou sistemas legados nesta fase.
- **RN04 - Sugestão Opcional de PDI (Copiloto):** A governança sistêmica do fluxo oficial de Planos de Desenvolvimento Individual (PDI) no RH está fora do MVP, mas a ferramenta ofertará a geração de sugestões iniciais de trilhas de desenvolvimento para apoiar o líder. O sistema também foca em acordos táticos de curto prazo.
- **RN05 - Metodologia SBI Obrigatória:** Feedbacks corretivos e de desenvolvimento gerados pela IA devem ser ancorados no modelo Situação-Comportamento-Impacto.

---

## 4. Backlog e Histórias de Usuário

### Épico 1: Geração de Roteiros Personalizados (Core)

**US01: Seleção de Perfil de Liderança**
- **Como** Líder
- **Eu quero** selecionar meu perfil comportamental (Técnico, Transição, Engajado) no primeiro uso
- **Para que** a IA ajuste automaticamente o tom, a linguagem e o nível de detalhamento dos roteiros de 1:1 e feedback gerados para mim.
- **Critérios de Aceite:**
  - O sistema deve apresentar opções claras com breves descrições dos perfis.
  - A escolha deve ser salva como preferência do usuário, mas permitindo alteração futura.
  - O vocabulário retornado para o Líder Técnico deve ser extremamente objetivo, focado em fatos e sem "jargões de RH".

**US02: Inserção Rápida de Contexto (LGPD Compliant)**
- **Como** Líder
- **Eu quero** inserir os pontos-chave a serem discutidos com meu liderado de forma simples e rápida
- **Para que** a IA tenha o insumo necessário para montar a estrutura da conversa.
- **Critérios de Aceite:**
  - O formulário de input deve ter dicas claras sobre não inserir dados sensíveis (nome completo, CPF, etc.), focando em comportamentos e entregas.
  - **Prevenção de Risco (LGPD):** Caso o líder digite informações médicas ou atestados, a IA deve recusar o contexto ou emitir um alerta contundente instruindo o gestor a remover os dados (conforme RN01).

**US03: Geração de Roteiro Estruturado e Adaptado**
- **Como** Líder
- **Eu quero** receber um roteiro estruturado (Check-in, Pauta do Liderado, Status, SBI e Acordos) adaptado ao meu perfil
- **Para que** eu me sinta seguro e preparado para conduzir a conversa, mesmo se for uma conversa difícil.
- **Critérios de Aceite:**
  - **Geração Ágil:** O sistema deve retornar o roteiro em poucos segundos após o envio do contexto, exigindo menos de 5 minutos do líder na interação total.
  - **Líder Técnico:** Roteiro deve ser em bullet points, direto e sem jargões.
  - **Líder em Transição:** Roteiro deve ser detalhado, com exemplos práticos de como introduzir cada tópico.
  - O roteiro deve obrigatoriamente incluir a estrutura de feedback SBI (Situação, Comportamento, Impacto) conforme a RN05.

**US06: Sugestão Opcional de Trilha de Desenvolvimento (PDI)**
- **Como** Líder
- **Eu quero** poder solicitar à IA uma sugestão de trilha de desenvolvimento (PDI) baseada no Framework de Levels antes da minha 1:1
- **Para que** eu tenha um ponto de partida estruturado para discutir e co-construir os próximos passos de carreira com meu liderado.
- **Critérios de Aceite:**
  - A funcionalidade deve ser **opcional**: o agente pode ofertar a sugestão ao identificar contexto de desenvolvimento, ou o líder pode solicitá-la ativamente.
  - O PDI sugerido deve ser simples e acionável: máximo de 2 a 3 objetivos, máximo de 3 ações práticas e marcos de verificação sugeridos.
  - A trilha deve estar ancorada nos comportamentos e competências do Framework de Levels da empresa.
  - **Disclaimer (Human-in-the-loop):** A interface e o retorno da IA devem apresentar um alerta explícito de que o PDI é apenas uma *sugestão inicial* para guiar a conversa, cabendo ao líder e ao liderado a definição final, com eventual aval do RH.

**📊 ESTIMATIVA DE STORY POINTS (US06)**
- **Atual:** 5 pontos
- **Histórico de Mudanças:**

| Data | Estimativa | Mudança | Motivo |
|------|------------|---------|--------|
| 2026-07-05 | 5 pts | - | Criação inicial após refinamento do MVP |

- **Análise Atual:** Complexidade Média / Risco Médio / Incerteza Média
- **Fatores que influenciaram:**
  - O principal esforço reside no *prompt engineering* para garantir que a IA obedeça às restrições de formatação (máximo de ações/objetivos).
  - Necessidade de injetar o contexto do Framework de Levels da empresa.
  - Implementação do alerta de responsabilidade (disclaimer) na interface/saída do agente.

### Épico 2: Continuidade e Histórico

**US04: Inserção do Histórico em Novos Roteiros**
- **Como** Líder (com foco no Líder Engajado)
- **Eu quero** que a IA considere os acordos e próximos passos definidos na última reunião ao gerar um novo roteiro
- **Para que** eu consiga dar continuidade ao desenvolvimento do meu liderado e garantir que os combinados não foram esquecidos.
- **Critérios de Aceite:**
  - Ao gerar um novo roteiro, a IA deve buscar o último registro (se houver) e incluir obrigatoriamente uma seção "Acompanhamento dos últimos acordos" e prazos definidos na sessão anterior.

**US05: Registro Rápido Pós-Reunião**
- **Como** Líder
- **Eu quero** registrar os acordos finais da 1:1 de forma simplificada
- **Para que** eles fiquem salvos no sistema para a próxima interação e sirvam como registro de evolução, substituindo planilhas e Word.

### Backlog Futuro / Próximos Incrementos (Fora do MVP)

As funcionalidades abaixo representam a visão de governança para o RH (v2 do produto). Elas foram retiradas do escopo inicial do MVP para garantirmos foco total na experiência e adoção pelos líderes.

| Funcionalidade Futura (V2) | Descrição Resumida | Valor Esperado |
|---|---|---|
| **Dashboard de Frequência** | Painel analítico para o RH visualizar a frequência das 1:1s por líder e área. | Mensurar adoção e engajamento da liderança sem micro-gestão. |
| **Mapa de Calor de Temas** | Visão anonimizada e agregada dos temas mais discutidos nas reuniões (ex: Carreira). | Identificar tendências organizacionais e necessidades de treinamento. |
| **Alertas de Risco** | Sistema onde o líder pode sinalizar manualmente riscos iminentes (ex: turnover). | Atuação preventiva e proativa do RH. |

---

## 5. Design e Interação (Comunicação)

A interface e as respostas da IA devem seguir o framework de comunicação (Messaging Framework):
- **Evitar o "tom de RH burocrático".**
- A linguagem deve abrir o diálogo ("O que está acontecendo com você nisso?") em vez de julgamentos terminativos ("Isso é inaceitável").
- A ferramenta deve ser vendida e percebida internamente como um facilitador que salva o tempo do gestor, e não como uma ferramenta de controle/micro-gestão da empresa.


