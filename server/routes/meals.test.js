import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import express from 'express'
import { openDatabase } from '../db/connection.js'
import { createMealsRouter } from './meals.js'

let server
let baseUrl
let db

beforeAll(() => {
  db = openDatabase(':memory:')
  const app = express()
  app.use(express.json())
  app.use(createMealsRouter(db))
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`
      resolve()
    })
  })
})

afterAll(() => {
  server.close()
  db.close()
})

beforeEach(() => {
  db.exec('DELETE FROM meal_groups')
})

const headers = { 'Content-Type': 'application/json', 'X-Profile-Id': 'default' }

function postMeal(body) {
  return fetch(`${baseUrl}/api/meals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/meals', () => {
  it('creates a meal group and returns 201', async () => {
    const res = await postMeal({
      eatenAt: '2026-10-19T12:00:00Z',
      description: 'Lunch',
      items: [{ name: 'Rice', kcal: 200, proteinG: 4, carbsG: 45, fatG: 0 }],
    })
    expect(res.status).toBe(201)
    expect((await res.json()).id).toBeTypeOf('number')
  })

  it('returns 400 when items is missing or empty', async () => {
    const res = await postMeal({ eatenAt: '2026-10-19T12:00:00Z', items: [] })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/meals', () => {
  it('returns 400 without a date', async () => {
    const res = await fetch(`${baseUrl}/api/meals`, { headers })
    expect(res.status).toBe(400)
  })

  it('lists the meals logged for a date', async () => {
    await postMeal({
      eatenAt: '2026-10-19T12:00:00Z',
      items: [{ name: 'Rice', kcal: 200, proteinG: 4, carbsG: 45, fatG: 0 }],
    })
    const res = await fetch(`${baseUrl}/api/meals?date=2026-10-19`, { headers })
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(1)
  })
})

describe('GET /api/totals', () => {
  it('returns totals for a single date', async () => {
    await postMeal({
      eatenAt: '2026-10-19T12:00:00Z',
      items: [{ name: 'Rice', kcal: 200, proteinG: 4, carbsG: 45, fatG: 0 }],
    })
    const res = await fetch(`${baseUrl}/api/totals?date=2026-10-19`, { headers })
    expect(res.status).toBe(200)
    expect((await res.json()).kcal).toBe(200)
  })

  it('returns totals for a range, one row per day', async () => {
    await postMeal({
      eatenAt: '2026-10-18T12:00:00Z',
      items: [{ name: 'Rice', kcal: 100, proteinG: 1, carbsG: 1, fatG: 1 }],
    })
    await postMeal({
      eatenAt: '2026-10-19T12:00:00Z',
      items: [{ name: 'Rice', kcal: 200, proteinG: 1, carbsG: 1, fatG: 1 }],
    })
    const res = await fetch(`${baseUrl}/api/totals?from=2026-10-17&to=2026-10-20`, {
      headers,
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(2)
  })

  it('returns 400 without date or from/to', async () => {
    const res = await fetch(`${baseUrl}/api/totals`, { headers })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/meals/last', () => {
  it('removes the last logged group', async () => {
    await postMeal({
      eatenAt: '2026-10-19T12:00:00Z',
      items: [{ name: 'Rice', kcal: 200, proteinG: 1, carbsG: 1, fatG: 1 }],
    })
    const res = await fetch(`${baseUrl}/api/meals/last`, { method: 'DELETE', headers })
    expect(res.status).toBe(200)
  })

  it('returns 404 when nothing is logged', async () => {
    const res = await fetch(`${baseUrl}/api/meals/last`, { method: 'DELETE', headers })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/meals (clear day)', () => {
  it('clears everything logged on a date', async () => {
    await postMeal({
      eatenAt: '2026-10-19T12:00:00Z',
      items: [{ name: 'Rice', kcal: 200, proteinG: 1, carbsG: 1, fatG: 1 }],
    })
    const res = await fetch(`${baseUrl}/api/meals?date=2026-10-19`, {
      method: 'DELETE',
      headers,
    })
    expect(res.status).toBe(200)
    expect((await res.json()).removedGroups).toBe(1)
  })

  it('returns 400 without a date', async () => {
    const res = await fetch(`${baseUrl}/api/meals`, { method: 'DELETE', headers })
    expect(res.status).toBe(400)
  })
})
