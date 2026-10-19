CREATE TABLE IF NOT EXISTS meal_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id TEXT NOT NULL DEFAULT 'default',
  eaten_at TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS meal_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL REFERENCES meal_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kcal REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL
);

-- Every query filters by profile_id and a date (or date range) on
-- eaten_at together (today's totals, totals for a range) — this
-- composite index lets SQLite satisfy both conditions directly from the
-- index instead of scanning every row in meal_groups.
CREATE INDEX IF NOT EXISTS idx_meal_groups_profile_date
  ON meal_groups (profile_id, eaten_at);
