# Registro de Otimizações de Performance

Este documento registra as implementações técnicas voltadas para a melhoria da fluidez, performance de renderização e otimização de banda da plataforma ClearIT Smart Leading.

## 📌 Histórico de Fases

### Fase Anterior: Bundle & Assets (Concluída)
- **Lazy Loading (React.lazy + Suspense):** Separação de todas as views principais (Leader, HR, Employee) reduzindo o peso do JavaScript inicial.
- **Vendor Splitting (Vite manualChunks):** Divisão de dependências pesadas (`react`, `firebase`, `recharts`, `radix`) em arquivos cacheados separadamente no navegador.
- **Preconnect (index.html):** DNS prefetch para os domínios do Google Fonts e Firebase Auth, ganhando ~100ms no `Time to First Byte`.
- **Resultados:** Redução do bundle inicial do React de **1.280 KB para 67 KB** (-94%).

---

## 🚀 Fase Atual: Fluidez e Dados (Em Progresso)

**Objetivo:** Eliminar telas de *loading* indesejadas, pulos de tela (*layout shifts*) e processamento redundante durante a navegação entre abas.
**Escopo Inicial:** Foco no Dashboard do Líder.

### 1. Caching e Estado com React Query (Estratégia 1)
- **Status:** ✅ Concluído
- **O que foi feito:** Integração total com `@tanstack/react-query` via hooks customizados ([useLeaderData.js](file:///c:/pulseMais/atividadeFinal/CoreComunication-main/frontend/src/hooks/useLeaderData.js)) para busca de métricas, reuniões, itens de ação, prontuário e histórico.
- **Impacto:**
  - Requisições repetidas eliminadas com tempo de stale padrão configurado.
  - Comportamento *stale-while-revalidate* ativado (troca instantânea de abas com atualização em segundo plano).
  - Invalidação seletiva de cache (`invalidateQueries`) em mutações (agendamentos, aprovação de PDI, conclusões de ação).

### 2. Skeletons (Estratégia 2)
- **Status:** ✅ Concluído
- **O que foi feito:** Implementação de componentes de Skeleton com `animate-pulse` em todas as seções críticas do Dashboard do Líder.
- **Impacto:** Eliminação completa do *Layout Shift* durante o carregamento de dados remotos.

### 3. Memoização de Gráficos (Estratégia 3)
- **Status:** Planejado
- **O que é:** Uso de `React.memo` para encapsular componentes pesados (como os do `recharts`).
- **Impacto:** Impede que os gráficos sejam re-renderizados quando o usuário digita algo em outro lugar da tela, garantindo rolagem a 60 FPS.

### 4. Prefetching (Estratégia 4)
- **Status:** Planejado
- **O que é:** Disparar a busca de dados assim que o usuário faz *hover* (coloca o mouse em cima) do botão ou da aba.
- **Impacto:** Como o cérebro leva cerca de 200ms para clicar, a requisição já volta pronta ou no meio do caminho, tornando o clique literalmente instantâneo.
