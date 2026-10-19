import { Router } from 'express'
import {
  addMeal,
  listByDate,
  totalsByDate,
  totalsByRange,
  removeLastGroup,
  clearDay,
} from '../db/mealsRepository.js'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function profileIdFrom(req) {
  return req.get('X-Profile-Id') || 'default'
}

function isValidItem(item) {
  return (
    item &&
    typeof item.name === 'string' &&
    typeof item.kcal === 'number' &&
    typeof item.proteinG === 'number' &&
    typeof item.carbsG === 'number' &&
    typeof item.fatG === 'number'
  )
}

export function createMealsRouter(db) {
  const router = Router()

  router.post('/api/meals', (req, res) => {
    const { eatenAt, description, items } = req.body ?? {}
    if (typeof eatenAt !== 'string' || !Array.isArray(items) || items.length === 0) {
      res
        .status(400)
        .json({ error: 'eatenAt (string) and a non-empty items array are required' })
      return
    }
    if (!items.every(isValidItem)) {
      res
        .status(400)
        .json({ error: 'each item needs name, kcal, proteinG, carbsG and fatG' })
      return
    }

    try {
      const result = addMeal(db, {
        profileId: profileIdFrom(req),
        eatenAt,
        description,
        items,
      })
      res.status(201).json(result)
    } catch {
      res.status(400).json({ error: 'could not save meal' })
    }
  })

  router.get('/api/meals', (req, res) => {
    const { date } = req.query
    if (typeof date !== 'string' || !DATE_RE.test(date)) {
      res.status(400).json({ error: 'date (YYYY-MM-DD) query param is required' })
      return
    }
    res.json(listByDate(db, { profileId: profileIdFrom(req), date }))
  })

  router.get('/api/totals', (req, res) => {
    const { date, from, to } = req.query

    if (typeof date === 'string') {
      if (!DATE_RE.test(date)) {
        res.status(400).json({ error: 'date must be YYYY-MM-DD' })
        return
      }
      res.json(totalsByDate(db, { profileId: profileIdFrom(req), date }))
      return
    }

    if (typeof from === 'string' && typeof to === 'string') {
      if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
        res.status(400).json({ error: 'from and to must be YYYY-MM-DD' })
        return
      }
      res.json(totalsByRange(db, { profileId: profileIdFrom(req), from, to }))
      return
    }

    res.status(400).json({ error: 'provide either date, or both from and to' })
  })

  router.delete('/api/meals/last', (req, res) => {
    const removed = removeLastGroup(db, { profileId: profileIdFrom(req) })
    if (!removed) {
      res.status(404).json({ error: 'nothing logged for this profile' })
      return
    }
    res.json(removed)
  })

  router.delete('/api/meals', (req, res) => {
    const { date } = req.query
    if (typeof date !== 'string' || !DATE_RE.test(date)) {
      res.status(400).json({ error: 'date (YYYY-MM-DD) query param is required' })
      return
    }
    res.json(clearDay(db, { profileId: profileIdFrom(req), date }))
  })

  return router
}
