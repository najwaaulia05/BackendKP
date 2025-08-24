// test-db.js
const db = require('./db');

async function testConnection() {
  try {
    const [rows] = await db.query('SHOW TABLES');
    console.log('✅ Koneksi berhasil. Daftar tabel:');
    console.table(rows);
  } catch (err) {
    console.error('❌ Gagal koneksi ke database:', err.message);
  } finally {
    process.exit();
  }
}

testConnection();
