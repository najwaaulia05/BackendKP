// db.js
const mysql = require('mysql2');

// Setup koneksi database
const pool = mysql.createPool({
  host: 'shortline.proxy.rlwy.net',
  user: 'root',
  password: 'sYTiLDWEIhLaZVVMRyIclTVvaUmDaZmU',
  database: 'railway',
  port: 3306,
});

module.exports = pool.promise();  // Menyediakan koneksi pool dengan promise
