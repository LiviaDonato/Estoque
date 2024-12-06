const { Pool } = require('pg');
const BD = new Pool({
    connectionString: process.env.DATABASE_URL
    // user: 'postgres', //Nome do usuário cadastrado no Banco de dados
    // host: 'localhost', //Endereço do servidor
    // database: 'estoque',//Nome do banco de dados a ser conectado
    // password: 'admin', //Senha do banco de dados
    // port: 5432, //Porta de conexão
})

module.exports = BD;