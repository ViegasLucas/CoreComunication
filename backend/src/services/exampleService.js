const { db } = require('../config/firebase');

const getSampleData = async () => {
    // Exemplo de como você acessaria o Firestore
    // se o banco estiver vazio, apenas retorna uma mensagem
    if (db) {
        // const snapshot = await db.collection('test-collection').get();
        // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { message: "Conectado ao Firebase! Service funcionando." };
    }
    
    return { message: "Firebase não inicializado corretamente. Verifique suas credenciais." };
};

module.exports = {
    getSampleData
};
