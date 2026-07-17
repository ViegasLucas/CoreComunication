# Documentação de Otimizações de Performance

Este documento rastreia todas as otimizações de performance aplicadas à aplicação CoreComunication, com o objetivo de manter a máxima fluidez e escalabilidade.

## 1. Otimizações de Code Splitting (Chunking) e Build
**Data:** 16/07/2026
**Escopo:** Global (Vite/Rollup)
**Descrição:**
Foi identificada a necessidade de reduzir o tamanho do bundle principal (`index.js`), que carregava todas as dependências da aplicação em um único arquivo, resultando em tempos de carregamento (TTFB/FCP) maiores e potenciais travamentos iniciais no frontend.

**Ações realizadas:**
- Ajuste no `vite.config.js` para usar uma função de separação manual de chunks (`manualChunks`) compatível com Vite 8 / Rolldown.
- Separação de bibliotecas pesadas e especializadas em chunks independentes:
  - `vendor-react`: `react`, `react-dom`, `react-router-dom`
  - `vendor-firebase`: `firebase` (todas as sub-bibliotecas)
  - `vendor-charts`: `recharts`
  - `vendor-radix`: `@radix-ui`
  - `vendor-date`: `date-fns`
  - `vendor-markdown`: `react-markdown`
  - `vendor-icons`: `lucide-react`
- O bundle `index.js` foi drasticamente reduzido (de ~1.2MB+ para ~90KB gzipados dependendo da análise).
- Isso melhora o carregamento paralelo dos recursos pelos navegadores e possibilita cache de longa duração (long-term caching) para bibliotecas externas que não mudam frequentemente.

## 2. Otimizações no Perfil do Líder (Leader Dashboard)
**Data:** 16/07/2026
**Escopo:** Visualizações do Líder (`LeaderDashboardView.tsx`, abas relacionadas)
**Descrição:**
A tela do líder executava múltiplos `fetch` isolados simultaneamente (`fetchTeam`, `fetchMetrics`, `fetchMeetings`, `fetchHistory`) dentro de `useEffect` sem caching. Ao trocar de aba, ou renderizar subcomponentes (`TeamsTab.jsx`, `EngagementTab.jsx`), as mesmas requisições repetiam. O estado de "loading" causava repintura severa na UI toda, quebrando a ilusão de fluidez.

**Ações realizadas:**
- **Integração do `@tanstack/react-query`:** 
  - Configuramos o `QueryClientProvider` no topo da aplicação (`main.jsx`) para interceptar e fazer cache das requisições.
  - O `staleTime` para queries comuns de dados em tempo real foi definido para 5 minutos (5 * 60 * 1000). Dados mantidos em tela agora se atualizam apenas quando são consideradas as mutações (ex: "Criar 1:1" aciona `queryClient.invalidateQueries(['meetings'])`).
- **Extração de Hooks Reutilizáveis:**
  - Criado o arquivo `hooks/useLeaderData.js` contendo os hooks encapsulados (`useTeam`, `useMetrics`, `useMeetings`, `useHistory`). As abas do Leader não mais refazem fetch desnecessário caso o cache exista e seja válido.
- **Implementação de Skeletons (Skeleton UI):**
  - Adicionado o componente `Skeleton` baseado no TailwindCSS.
  - Ao invés de uma tela de "Loading..." que remove todo o visual, as seções da dashboard mostram espaços reservados (skeletons) que dão o feedback visual de progresso, aumentando significativamente a percepção de performance percebida e a fluidez do carregamento inicial.

## 3. Próximos Passos Sugeridos (Roadmap de Otimização)
- **Expansão do Cache:** Levar o React Query para os perfis `Employee` e `HR`.
- **Lazy Loading de Rotas:** Usar `React.lazy` e `Suspense` no `App.jsx` para carregar o código das dashboards apenas no momento em que o usuário logado pertence àquela rota específica.
- **Debounce em Buscas:** Na listagem de Times (`TeamsTab.jsx`), implementar Debounce na barra de busca (`searchQuery`) para evitar re-renderizações acentuadas em grandes listas ao digitar rapidamente.
- **Virtualização de Listas:** Caso o tamanho de equipes se torne gigantesco, usar bibliotecas de virtualização (como `@tanstack/react-virtual`) para não renderizar milhares de DOM elements fora da viewport de uma vez.
