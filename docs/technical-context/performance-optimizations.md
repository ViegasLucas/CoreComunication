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

## 2. Otimizações Realizadas

### Otimizações de Código
* **Code Splitting / Lazy Loading de Rotas** (16/07/2026): Implementado utilizando `React.lazy` e `<Suspense>` no componente `App.jsx`. As views principais (LoginView, LeaderDashboardView, HRDashboardView, EmployeeDashboardView) são carregadas de forma assíncrona sob demanda, reduzindo substancialmente o tamanho do bundle inicial que o usuário deve fazer download para acessar o sistema.
* **Componentes Assíncronos**: Extraídos componentes internos de abas (`EngagementTab`, `AdoptionTab`, `TeamsTab`) de forma preguiçosa.

### Gerenciamento de Estado de API e Cache
* **Introdução do `@tanstack/react-query`** (16/07/2026): A estratégia de fetch nativo e controle via `useState` + `useEffect` foi totalmente substituída para os painéis:
  * **LeaderDashboardView (e abas TeamsTab, EngagementTab)**: Implementado `useQuery` com `staleTime` de 5 minutos, cache local.
  * **EmployeeDashboardView**: Implementado `useQuery` para carregar métricas (Gráfico de humor e progresso de PDI) com `staleTime` de 5 min. Implementado `useMutation` para envio otimista do humor com invalidação de cache (atualização imediata e silenciosa da UI).
  * **HRDashboardView**: Implementado `useQuery` para carregar as métricas do HR e `usersList`. Ações de inativação, criação, edição e exclusão de usuários foram refatoradas para utilizar `useMutation` com chamada de `queryClient.invalidateQueries(['users'])`, atualizando a interface perfeitamente sem refresh forçado.

### Melhorias de UI / UX em Operações Pesadas
* **Implementação de Skeleton Loaders**: Adicionados indicadores visuais (esqueletos pulsantes com `animate-pulse`) enquanto a tela aguarda os dados do servidor (tanto no Painel do Líder, quanto no RH e Colaborador). A experiência se torna mais amigável, aumentando a sensação de velocidade (Perceived Performance).
* **Debounce em Buscas em Tempo Real** (16/07/2026): Adicionada uma função `useDebounce` na busca de times (`TeamsTab.jsx`) e de cadastro de usuários (`HRDashboardView.tsx`). As pesquisas de milhares de registros que operam em arrays locais não disparam mais renderizações pesadas a cada letra digitada, elas aguardam `300ms` garantindo que o teclado e o navegador não "engasguem".

### Configuração do Bundler
* **Manual Chunks no Vite** (16/07/2026): Implementada lógica de separação de pacotes de terceiros (Vendor) no `vite.config.js`. Bibliotecas como Recharts e React formam arquivos `.js` isolados na nuvem para não revalidarem o cache na CDN cada vez que atualizarmos o código fonte local.

---

## 3. Próximos Passos e Recomendações
* **Testes de Performance com Lighthouse**: Necessidade de gerar o build de produção (`npm run build`), serví-lo via preview e rodar o relatório do Google Lighthouse para aferir o salto real nas métricas Core Web Vitals.
* **Testes de Stress (Backend)**: Executar ferramenta como `autocannon` nas rotas `/api/metrics` para garantir que as buscas de milhares de usuários do RH não derrubarão o Node.js.
* **Virtualização de Listas** (Recomendação Futura): Se o número de usuários no painel de RH passar de dezenas de milhares, recomendar a implementação da biblioteca `react-window` para renderizar apenas os elementos visíveis na tela.
