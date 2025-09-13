const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '154.219.108.225',
  user: 'zepp',
  password: 'KeyZeC5eJRSi5ZSk',
  database: 'zepp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

