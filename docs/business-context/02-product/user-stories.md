# Backlog do Produto: Smart Leading (MVP)

Este documento contém as Histórias de Usuário (User Stories) extraídas da documentação de produto (Product Discovery, Estratégia e Funcionalidades) para o MVP do Smart Leading.

## Épico 1: Geração de Roteiros Personalizados (Core)

**US01: Seleção de Perfil de Liderança**
- **Como** Líder
- **Eu quero** selecionar meu perfil comportamental (Técnico, Transição, Engajado) no primeiro uso
- **Para que** a IA ajuste automaticamente o tom, a linguagem e o nível de detalhamento dos roteiros de 1:1 e feedback gerados para mim.
- **Critérios de Aceite:**
  - O sistema deve apresentar opções claras com breves descrições dos perfis.
  - A escolha deve ser salva como preferência do usuário, mas permitindo alteração futura.

**US02: Inserção Rápida de Contexto (LGPD Compliant)**
- **Como** Líder
- **Eu quero** inserir os pontos-chave a serem discutidos com meu liderado de forma simples e rápida
- **Para que** a IA tenha o insumo necessário para montar a estrutura da conversa.
- **Critérios de Aceite:**
  - O formulário de input deve ter dicas claras sobre não inserir dados sensíveis (nome completo, CPF, etc.), focando em comportamentos e entregas.

**US03: Geração de Roteiro Estruturado e Adaptado**
- **Como** Líder
- **Eu quero** receber um roteiro estruturado (Check-in, Pauta do Liderado, Status, SBI e Acordos) adaptado ao meu perfil
- **Para que** eu me sinta seguro e preparado para conduzir a conversa, mesmo se for uma conversa difícil.
- **Critérios de Aceite:**
  - Líder Técnico: Roteiro deve ser em bullet points, direto e sem jargões.
  - Líder em Transição: Roteiro deve ser detalhado, com exemplos práticos de como introduzir cada tópico.
  - O roteiro deve obrigatoriamente incluir a estrutura de feedback SBI (Situação, Comportamento, Impacto).

## Épico 2: Continuidade e Histórico

**US04: Inserção do Histórico em Novos Roteiros**
- **Como** Líder (com foco no Líder Engajado)
- **Eu quero** que a IA considere os acordos e próximos passos definidos na última reunião ao gerar um novo roteiro
- **Para que** eu consiga dar continuidade ao desenvolvimento do meu liderado e garantir que os combinados não foram esquecidos.
- **Critérios de Aceite:**
  - Ao gerar um novo roteiro, a IA deve buscar o último registro (se houver) e incluir uma seção "Acompanhamento dos últimos acordos".

**US05: Registro Rápido Pós-Reunião**
- **Como** Líder
- **Eu quero** registrar os acordos finais da 1:1 de forma simplificada
- **Para que** eles fiquem salvos no sistema para a próxima interação e sirvam como registro de evolução, substituindo planilhas e Word.

## Épico 3: Governança e Dados (Visão RH)

**US06: Dashboard de Frequência**
- **Como** profissional de RH
- **Eu quero** visualizar um painel com a frequência e assiduidade das 1:1s por líder e por área
- **Para que** eu possa mensurar o engajamento da liderança e a adoção da ferramenta sem precisar cobrar cada gestor manualmente.

**US07: Mapa de Calor de Temas (Anonimizado)**
- **Como** profissional de RH
- **Eu quero** visualizar um mapa de calor com os temas mais discutidos nas reuniões (ex: Carreira, Entregas, Comportamento) 
- **Para que** eu possa identificar tendências, gargalos ou necessidades de treinamento na empresa.
- **Critérios de Aceite:**
  - Os dados devem ser estritamente agregados e anonimizados, sem expor quem é o liderado e qual o líder.

**US08: Alertas de Risco Direcionados**
- **Como** profissional de RH
- **Eu quero** receber um alerta diretamente na plataforma caso um líder flagelise (marque manualmente) uma situação de risco (ex: risco iminente de turnover, problema grave de conduta)
- **Para que** o RH possa agir de forma preventiva e proativa antes que o problema se concretize.
