const express = require('express');
const cors = require('cors');
const exampleController = require('./controllers/exampleController');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', exampleController.getExample);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});

module.exports = app;
