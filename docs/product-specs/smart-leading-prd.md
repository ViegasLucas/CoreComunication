# Especificação do Produto (PRD) — Smart Leading

Este documento atua como a única fonte da verdade para o desenvolvimento do **Smart Leading**, um agente de Inteligência Artificial da ClearIT. Ele consolida o contexto de negócio, as regras que regem o sistema e os critérios de aceite que balizam o desenvolvimento.

---

## 1. Visão Geral e Objetivos (POR QUE e O QUE)

### O Problema
Atualmente, as lideranças da ClearIT possuem uma execução fragmentada de reuniões de 1:1 e feedbacks. A falta de preparo e o baixo repertório emocional para lidar com conversas difíceis geram um desgaste nas relações. Além disso, os registros dessas interações são descentralizados (Word, Excel, Sólides) ou inexistentes, criando um "ponto cego analítico" para o RH, o que resultou em queda nos indicadores de Liderança e Confiança e no eNPS.

### A Solução
Um agente inteligente que atua *antes* da conversa, provendo roteiros de 1:1 e feedbacks estruturados e personalizados baseados no contexto, no modelo SBI (Situação, Comportamento e Impacto) e no Framework de Levels da empresa.

### Métricas de Sucesso
- Aumento da frequência de 1:1s e adoção orgânica por parte dos líderes.
- Recuperação qualitativa dos indicadores de **eNPS** e **Índice de Liderança e Confiança**.
- Eliminação do ponto cego do RH através de painéis analíticos agregados.

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
- **RN04 - Exclusão de PDI:** A criação e governança de Planos de Desenvolvimento Individual (PDI) estão fora do escopo do MVP. O sistema foca em acordos táticos de curto prazo da 1:1.
- **RN05 - Metodologia SBI Obrigatória:** Feedbacks corretivos e de desenvolvimento gerados pela IA devem ser ancorados no modelo Situação-Comportamento-Impacto.

---

## 4. Requisitos Funcionais e Critérios de Aceite (Como se comporta)

As histórias a seguir definem as entregas esperadas para a engenharia e QA:

### História 1: Geração de Roteiro
- **CA01 - Geração Ágil:**
  - *Dado que* um líder precisa realizar uma reunião de 1:1,
  - *Quando* ele inserir o contexto comportamental do colaborador,
  - *Então* o sistema deve retornar um roteiro estruturado (Check-in, Pauta, Status, Desenvolvimento e Acordos) em poucos segundos, exigindo menos de 5 minutos do líder na interação.

### História 2: Personalização por Persona
- **CA02 - Adaptação de Tom:**
  - *Dado que* a IA identificou o líder como "Líder Técnico",
  - *Quando* gerar a estrutura da reunião,
  - *Então* o vocabulário retornado deve ser extremamente objetivo, focado em fatos e desprovido de "jargões de RH".

### História 3: Histórico de Reuniões
- **CA03 - Resgate de Acordos Anteriores:**
  - *Dado que* um gestor inicia o preparo de uma 1:1 recorrente,
  - *Quando* o sistema gerar a pauta,
  - *Então* o agente de IA deve incluir obrigatoriamente os acordos e prazos definidos na sessão anterior.

### História 4: Painel Analítico
- **CA04 - Dashboard de Governança para RH:**
  - *Dado que* os gestores estão utilizando o sistema,
  - *Quando* o perfil de RH acessar a visão analítica,
  - *Então* o sistema deve exibir dados agregados (frequência de reuniões por líder/área e mapa de calor dos temas), sem expor a identidade dos liderados.

### História 5: Prevenção Legal
- **CA05 - Prevenção de Risco/LGPD:**
  - *Dado que* um líder digita informações médicas ou atestados no contexto,
  - *Quando* tentar solicitar o roteiro,
  - *Então* a IA deve recusar o contexto ou emitir um alerta contundente instruindo o gestor a remover dados sensíveis.

---

## 5. Design e Interação (Comunicação)

A interface e as respostas da IA devem seguir o framework de comunicação (Messaging Framework):
- **Evitar o "tom de RH burocrático".**
- A linguagem deve abrir o diálogo ("O que está acontecendo com você nisso?") em vez de julgamentos terminativos ("Isso é inaceitável").
- A ferramenta deve ser vendida e percebida internamente como um facilitador que salva o tempo do gestor, e não como uma ferramenta de controle/micro-gestão da empresa.
