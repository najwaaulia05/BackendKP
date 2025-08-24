// server.js
import express from 'express'
import { supabase } from './db.js'

const app = express()

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
    minPrice,
    maxPrice
  } = req.query

  // base query ke tabel places dengan relasi ratings + operatinghours
  let query = supabase
    .from('places')
    .select(`
      *,
      ratings(rating, reviews),
      operatinghours(opening_time, closing_time)
    `)

  if (city) query = query.ilike('address', `%${city}%`)
  if (subdistrict) query = query.eq('kecamatan_id', subdistrict)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (ecoFriendly !== undefined) query = query.eq('eco_friendly', ecoFriendly)
  if (weather) query = query.ilike('categorize_weather', `%${weather}%`)
  if (minPrice) query = query.gte('min_price', minPrice)
  if (maxPrice) query = query.lte('max_price', maxPrice)

  // ambil data
  const { data, error } = await query

  if (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }

  // filter tambahan di Node.js (karena supabase-js gak bisa langsung filter di relasi child)
  let results = data.map(item => {
    return {
      ...item,
      rating: item.ratings?.[0]?.rating ? parseFloat(item.ratings[0].rating).toFixed(2) : null,
      reviews: item.ratings?.[0]?.reviews ?? null,
      operating_hours: item.operatinghours?.[0] ?? {}
    }
  })

  // filter openingHours manual
  if (openingHours) {
    results = results.filter(r => {
      const opening = r.operating_hours.opening_time
      if (!opening) return false

      if (openingHours === 'Morning') {
        return opening >= '06:00:00' && opening <= '11:59:59'
      } else if (openingHours === 'Afternoon') {
        return opening >= '12:00:00' && opening <= '17:59:59'
      } else if (openingHours === 'Night') {
        return opening >= '18:00:00' && opening <= '23:59:59'
      } else if (openingHours === '24 hours') {
        return r.operating_hours.opening_time === '00:00:00' && r.operating_hours.closing_time === '23:59:59'
      }
      return true
    })
  }

  // filter rating & reviews manual
  if (minRating) results = results.filter(r => r.rating && r.rating >= parseFloat(minRating))
  if (minReviews) results = results.filter(r => r.reviews && r.reviews >= parseInt(minReviews))

  res.json(results)
})

export default app
