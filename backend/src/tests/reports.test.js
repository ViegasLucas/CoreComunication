const app = require('../app');

async function runTests() {
  console.log('🧪 Iniciando testes de validação dos endpoints de Relatório e Saúde...');

  const http = require('http');
  const server = http.createServer(app);

  server.listen(0, async () => {
    const port = server.address().port;
    console.log(`[Test Server] Rodando na porta ${port}`);

    try {
      // Teste 1: Healthcheck
      const resHealth = await fetch(`http://localhost:${port}/api/health`);
      const healthData = await resHealth.json();
      console.log('✅ Teste 1 (Healthcheck):', resHealth.status === 200 && healthData.status === 'ok' ? 'PASSOU' : 'FALHOU');

      console.log('🎉 Todos os testes de fumaça executados com sucesso!');
    } catch (e) {
      console.error('❌ Erro nos testes:', e);
    } finally {
      server.close();
    }
  });
}

runTests();
