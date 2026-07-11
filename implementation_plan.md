# Estruturar Botões e Remover Redundâncias de 1:1

A tela inicial ficou linda, mas você tem razão: há uma sobreposição de funcionalidades agora que introduzimos o **Assistente de Liderança** poderoso, e os botões recém-criados ainda precisam da função ativadora.

## O Problema Atual
1. Os 3 botões rápidos (`Dar Feedback`, `Pauta de 1:1`, `Elaborar PDI`) chamam uma função `openChatWithIntent` que ainda não existe no código, o que os deixa inoperantes.
2. Temos múltiplos caminhos para fazer a mesma coisa:
   - Existe um botão "Nova 1:1" pequeno no topo da tela.
   - Existe um botão "Criar nova 1:1" na lista de reuniões que abre uma aba lateral (Sheet).
   - A aba lateral antiga de "Nova 1:1" possui um campo rudimentar de "Gerar Roteiro SBI (IA)", que agora conflita com o super-assistente (Dar Feedback).

## Plano de Implementação

### 1. Dar Vida aos 3 Botões de Ação Rápida (IA)
Vamos criar a função `openChatWithIntent(intent)` no `LeaderDashboardView.tsx`.
Essa função fará o seguinte:
- Atualizará o estado `chatIntent` (sbi, one_on_one, pdi).
- Limpará o histórico do chat atual e injetará uma **mensagem inicial personalizada** da IA, de acordo com o botão clicado, para engajar o líder.
- Abrirá o Modal do Assistente.

*Exemplos de mensagens iniciais dinâmicas:*
- **Feedback (SBI):** "Olá! Vamos preparar um roteiro de feedback. Sobre qual situação ou liderado você gostaria de falar?"
- **1:1:** "Olá! Vamos estruturar a pauta da sua próxima 1:1. Com quem será a reunião e quais são os pontos principais?"
- **PDI:** "Olá! Vamos elaborar um PDI. Qual liderado estamos desenvolvendo e qual a competência alvo?"

### 2. Eliminar as Redundâncias (Simplificar a Tela Inicial)
- **Remover a geração de SBI da aba lateral de Reunião:** Como agora temos o "Assistente ClearIT" exclusivo para isso na Home (botão Laranja), não precisamos mais do botão "Gerar Roteiro SBI" perdido dentro do formulário de agendamento.
- **Unificar os Botões de 1:1:**
   - **Opção A (Recomendada):** O botão azul pequeno do cabeçalho passa a ser focado no Assistente. Ele pode abrir a aba lateral de agendamento puro, enquanto o botão da Home cuida da *geração de pauta*.
   - Ou podemos renomear o botão da Home para "Planejar Reunião com IA" e deixar o agendamento de calendário exclusivo para o formulário lateral.

> [!IMPORTANT]
> **Decisão de UI/UX para a aba de "Criar nova 1:1":**  
> Você quer que a aba lateral direita (Sheet de Agendamento de 1:1) perca a funcionalidade antiga de gerar texto de IA e sirva apenas para marcar data/hora/pessoa no calendário? (Essa é a melhor prática para que o Assistente seja o único local que escreve os textos para você).

## Próximos Passos
Se aprovar este plano, eu irei codificar a função `openChatWithIntent`, arrumar a lógica dos botões da IA, e enxugar o formulário de "Nova 1:1" para focar só em agendamento, limpando a redundância da sua tela.
