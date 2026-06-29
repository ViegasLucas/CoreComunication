# Product Discovery: Smart Leading (Mapa do Problema e Personas)

*Documento original de levantamento de hipóteses, dores e personas para a solução de RH (Smart Leading).*

## Sintomas Observados

1. **Fragmentação:** A execução das reuniões de 1:1 (conversas individuais de alinhamento) e feedbacks é altamente fragmentada em toda a organização.
2. **Irregularidade:** Parte das lideranças realiza as reuniões de forma irregular, enquanto outra parte simplesmente não as realiza.
3. **Falta de Padronização:** A condução das conversas depende exclusivamente do estilo e da experiência de cada gestor, sem a adoção de um roteiro padronizado.
4. **Descentralização de Registros:** O registro do pós-conversa apresenta forte descentralização de dados, ocorrendo de maneira dispersa em plataformas como Sólides, arquivos de Word, planilhas de Excel ou, frequentemente, sem nenhum registro formal.
5. **PDIs Estagnados:** Os Planos de Desenvolvimento Individual (PDIs) elaborados são muitas vezes genéricos ou inexistentes, não apresentando evolução contínua entre os ciclos de avaliação.

## Principais Dores (Problemas Raiz)

1. **Falta de Preparo e Padronização Operacional:** Os líderes entram nas reuniões improvisando as pautas devido à falta de tempo e organização prévia. Isso gera uma inconsistência sistêmica, onde colaboradores de gestores preparados recebem suporte de qualidade, e outros ficam desassistidos.
2. **Ponto Cego Analítico:** A área de Recursos Humanos carece de visibilidade e governança sobre os dados das lideranças. O RH não consegue mensurar quem está realizando os feedbacks, com qual cadência e quais temas estão sendo efetivamente discutidos.
3. **Baixo Repertório Emocional para Gestão de Crises:** Existe uma dificuldade técnica e comportamental, especialmente por parte de líderes recém-promovidos, em conduzir conversas de alta complexidade emocional, como alinhamentos de expectativa e feedbacks de baixa performance.

---

## Personas Mapeadas

### 1. Líder Técnico
- **Perfil:** Baixa tolerância a processos de RH percebidos como burocracia, que pareçam mais uma obrigação.
- **Necessidade:** Precisa de roteiros diretos, rápidos e sem jargão de RH. Realiza os feedbacks por obrigação e precisa de suporte para conduzir uma interação mais humana.

### 2. Líder em Transição (Técnico para Gestão)
- **Perfil:** Não possui experiência com gestão de pessoas, o que causa uma falta de repertório emocional e estrutura para conversas difíceis.
- **Necessidade:** Tem muita vontade de aprender, porém precisa de roteiros detalhados com validação passo a passo.

### 3. Líder Engajado com Gestão de Pessoas
- **Perfil:** Entende a importância do feedback, acredita nos 1:1s e reconhece a sua importância.
- **Necessidade:** O gargalo é operacional. Não tem organização de tempo e estrutura para criar e estruturar conversas no cotidiano.

---

## Prováveis Soluções (Features Idealizadas)

- **Seleção de Perfil (Persona-based):** O agente de IA vai dar opções de perfis de líderes pré-existentes (ou descobrir via teste interativo) e o gestor vai escolher aquele que mais combina com ele, com isso personalizando as pautas e estrutura de feedback de acordo com o tom adequado.
- **IA com Histórico:** A IA cruza dados de 1:1s passadas para sugerir as pautas da próxima reunião, evitando que combinados sejam esquecidos.

---

## Hipóteses Levantadas

- **H1. Hipótese de Adesão (Foco no Líder Técnico):** 
  - *Problema:* Resolve a dor da aversão à burocracia e jargões. 
  - *Hipótese:* Acreditamos que entregar roteiros rápidos e sem jargões de RH vai quebrar a resistência desse perfil. 
  - *Métrica:* 70% de adoção e tempo de preparo menor que 5 minutos.
- **H2. Hipótese de Eficácia (Foco no Líder em Transição):** 
  - *Problema:* Resolve o sintoma de falta de repertório e dificuldade emocional. 
  - *Hipótese:* Acreditamos que roteiros passo a passo e humanizados darão o repertório emocional necessário para conversas difíceis. 
  - *Métrica:* Aumento na percepção de clareza e empatia após os feedbacks.
- **H3. Hipótese de Engajamento e Retenção (Foco no Líder Engajado):** 
  - *Problema:* Resolve o problema da falta de organização e PDIs genéricos/inexistentes. 
  - *Hipótese:* Acreditamos que automatizar a criação das pautas poupará tempo e impedirá que os PDIs fiquem estagnados. 
  - *Métrica:* Uso recorrente da ferramenta e PDIs atualizados a cada nova 1:1 ou feedback.
- **H4. Hipótese de Governança de Dados (Foco no RH):** 
  - *Problema:* Resolve o ponto cego analítico e a descentralização. 
  - *Hipótese:* Centralizar tudo na IA eliminará o "ponto cego" de informações dispersas no Word/Excel ou Sólides. 
  - *Métrica:* Geração de painéis automáticos com frequência e temas das reuniões.
- **H5. Hipótese Técnica (Foco no Perfilamento da IA):** 
  - *Problema:* Testa a ideia de como a IA deve se comportar. 
  - *Hipótese:* Adaptar o tom da IA ao perfil do gestor gerará roteiros mais eficientes do que um formato único. 
  - *Métrica:* Alta nota de satisfação do líder com o roteiro logo na primeira tentativa.
- **H6. Hipótese de Continuidade:** 
  - *Problema:* Histórico isolado. 
  - *Hipótese:* Cruzar o histórico elimina o improviso e conecta os ciclos de feedback. 
  - *Métrica:* Líderes aceitarem >60% das pautas sugeridas pela IA.
