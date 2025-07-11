// db.js
const mysql = require('mysql2');

// Setup koneksi database
const pool = mysql.createPool({
  host: 'crossover.proxy.rlwy.net',
  user: 'root',
  password: 'ZiCBGLBGVEQQzdfYysRcLGRWhBWqKfUc',
  database: 'railway',
  port: 53800,
});

module.exports = pool.promise();  // Menyediakan koneksi pool dengan promise
