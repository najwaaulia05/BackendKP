// index.js
const express = require('express');
const db = require('../db');

const app = express();
app.use(express.json());

// Helper function untuk query database
const queryDatabase = async (query, params = []) => {
  try {
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Endpoint untuk restoran dengan pencarian dinamisnp
app.get('/restaurants/search', async (req, res) => {
  const { 
    city, 
    subdistrict, 
    ecoFriendly, 
    weather, 
    categoryId, 
    openingHours, 
    minRating, 
    minReviews,
    minPrice,   // Menambahkan parameter minPrice
    maxPrice    // Menambahkan parameter maxPrice
  } = req.query;

  let query = `
    SELECT DISTINCT p.*, r.rating, r.reviews,
      (SELECT opening_time FROM operatinghours WHERE place_id = p.id LIMIT 1) AS opening_time,
      (SELECT closing_time FROM operatinghours WHERE place_id = p.id LIMIT 1) AS closing_time
    FROM places p
    LEFT JOIN ratings r ON p.id = r.place_id
    WHERE 1=1
  `;
  let params = [];

  // Pencarian berdasarkan kota
  if (city) {
    query += " AND p.address LIKE ?";
    params.push(`%${city}%`);
  }

  // Pencarian berdasarkan kecamatan (ID kecamatan)
  if (subdistrict) {
    query += " AND p.kecamatan_id = ?";
    params.push(subdistrict);
  }

  // Pencarian berdasarkan kategori
  if (categoryId) {
    query += " AND p.category_id = ?";
    params.push(categoryId);
  }

  // Pencarian berdasarkan eco-friendly
  if (ecoFriendly !== undefined) {
    query += " AND p.eco_friendly = ?";
    params.push(ecoFriendly);
  }

  // Pencarian berdasarkan cuaca (weather)
  if (weather) {
    query += " AND p.categorize_weather LIKE ?";
    params.push(`%${weather}%`);
  }

  // Pencarian berdasarkan jam buka (operating hours)
  if (openingHours) {
    if (openingHours === 'Morning') {
      query += ` AND p.id IN (SELECT place_id FROM operatinghours WHERE opening_time BETWEEN '06:00:00' AND '11:59:59')`;
    } else if (openingHours === 'Afternoon') {
      query += ` AND p.id IN (SELECT place_id FROM operatinghours WHERE opening_time BETWEEN '12:00:00' AND '17:59:59')`;
    } else if (openingHours === 'Night') {
      query += ` AND p.id IN (SELECT place_id FROM operatinghours WHERE opening_time BETWEEN '18:00:00' AND '23:59:59')`;
    } else if (openingHours === '24 hours') {
      // Modifikasi untuk mencari restoran yang buka 24 jam, supaya tidak mengambil semua jam buka
      query += ` AND p.id IN (SELECT place_id FROM operatinghours WHERE (opening_time = '00:00:00' AND closing_time = '23:59:59'))`;
    }
  }

  // Pencarian berdasarkan rating minimal
  if (minRating) {
    query += " AND r.rating >= ?";
    params.push(minRating);
  }

  // Pencarian berdasarkan jumlah review minimal
  if (minReviews) {
    query += " AND r.reviews >= ?";
    params.push(minReviews);
  }

  // Pencarian berdasarkan rentang harga
  if (minPrice) {
    query += " AND p.min_price >= ?";
    params.push(minPrice);
  }

  if (maxPrice) {
    query += " AND p.max_price <= ?";
    params.push(maxPrice);
  }

  const results = await queryDatabase(query, params);

  // batasi desimal rating jadi maksimal 2 angka
  results.forEach(result => {
    if (result.rating !== null) {
      result.rating = result.rating.toFixed(2); // Membatasi menjadi 2 angka desimal
    }
  });

  // Menambahkan informasi jam buka dan tutup di dalam response, lalu menghapus kolom duplikat
  results.forEach(result => {
    result.operating_hours = {
      opening_time: result.opening_time,
      closing_time: result.closing_time
    };
    
    // Menghapus kolom opening_time dan closing_time yang duplikat
    delete result.opening_time;
    delete result.closing_time;
  });

  res.json(results);
});

module.exports = app;