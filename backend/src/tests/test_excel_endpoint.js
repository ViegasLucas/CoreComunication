const reportController = require('../controllers/reportController');

async function testHandlers() {
  const req = { user: { uid: 'visaolider' } };
  const res = {
    headers: {},
    setHeader(key, val) {
      this.headers[key] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(data) {
      console.log(`[TEST SUCCESS] Status: ${this.statusCode}, Header:`, this.headers);
      console.log(`Data preview (first 100 chars):`, String(data).substring(0, 100));
    },
    json(data) {
      console.log(`[TEST JSON] Status: ${this.statusCode}, Data:`, data);
    }
  };

  console.log('--- Testando exportTeamExcel ---');
  await reportController.exportTeamExcel(req, res);

  console.log('--- Testando exportSbiPdf ---');
  await reportController.exportSbiPdf(req, res);
}

testHandlers();
