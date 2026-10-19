import { describe, expect, it } from 'vitest'
import { openDatabase } from './connection.js'

describe('openDatabase', () => {
  it('applies schema.sql and creates the expected tables', () => {
    const db = openDatabase(':memory:')
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name)

    expect(tables).toContain('meal_groups')
    expect(tables).toContain('meal_items')
    db.close()
  })

  it('enforces foreign keys (cascade delete works)', () => {
    const db = openDatabase(':memory:')
    db.prepare(
      "INSERT INTO meal_groups (id, profile_id, eaten_at, description) VALUES (1, 'default', '2026-10-19T12:00:00Z', 'Lunch')",
    ).run()
    db.prepare(
      'INSERT INTO meal_items (group_id, name, kcal, protein_g, carbs_g, fat_g) VALUES (1, ?, ?, ?, ?, ?)',
    ).run('Rice', 200, 4, 45, 0)

    db.prepare('DELETE FROM meal_groups WHERE id = 1').run()

    const remainingItems = db
      .prepare('SELECT * FROM meal_items WHERE group_id = 1')
      .all()
    expect(remainingItems).toHaveLength(0)
    db.close()
  })

  it('creates the data directory for a file-based path', () => {
    const dbPath = './data/diet.db'
    const db = openDatabase(dbPath)
    db.close()
    // No assertion needed beyond not throwing: mkdirSync + DatabaseSync
    // would have thrown if the directory couldn't be created/opened.
  })
})
