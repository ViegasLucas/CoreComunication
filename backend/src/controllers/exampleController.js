const exampleService = require('../services/exampleService');

const getExample = async (req, res) => {
    try {
        const result = await exampleService.getSampleData();
        res.status(200).json(result);
    } catch (error) {
        console.error("Erro no getExample controller:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getExample
};
