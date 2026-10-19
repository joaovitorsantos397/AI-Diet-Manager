import { DatabaseSync } from 'node:sqlite'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCHEMA_PATH = join(__dirname, 'schema.sql')
const DEFAULT_DB_PATH = './data/diet.db'

export function openDatabase(dbPath = process.env.DB_PATH || DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true })
  }

  const db = new DatabaseSync(dbPath)
  // SQLite enforces foreign keys per connection, off by default — without
  // this, "ON DELETE CASCADE" in schema.sql would silently do nothing and
  // removing a meal group would leave its items orphaned.
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(readFileSync(SCHEMA_PATH, 'utf8'))
  return db
}
