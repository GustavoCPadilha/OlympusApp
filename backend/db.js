
const mysql = require('mysql2');

const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = '1234';
const DB_NAME = 'gymapp';
const DB_PORT = 3306;

// Usar pool é mais resiliente para múltiplas requisições e reconexões
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL (pool)!');
  connection.release();
});

module.exports = pool;