const DEFAULT_PROFILE_ID = 'default'

const EMPTY_TOTALS = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }

// Group + items are written inside one transaction: if any item insert
// fails (e.g. a NOT NULL constraint), the ROLLBACK undoes the group
// insert too, so a meal is never left half-written.
export function addMeal(
  db,
  { profileId = DEFAULT_PROFILE_ID, eatenAt, description = null, items },
) {
  db.exec('BEGIN')
  try {
    const groupId = db
      .prepare(
        'INSERT INTO meal_groups (profile_id, eaten_at, description) VALUES (?, ?, ?)',
      )
      .run(profileId, eatenAt, description).lastInsertRowid

    const insertItem = db.prepare(
      'INSERT INTO meal_items (group_id, name, kcal, protein_g, carbs_g, fat_g) VALUES (?, ?, ?, ?, ?, ?)',
    )
    for (const item of items) {
      insertItem.run(
        groupId,
        item.name,
        item.kcal,
        item.proteinG,
        item.carbsG,
        item.fatG,
      )
    }

    db.exec('COMMIT')
    return { id: Number(groupId) }
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function listByDate(db, { profileId = DEFAULT_PROFILE_ID, date }) {
  const groups = db
    .prepare(
      `SELECT id, eaten_at, description FROM meal_groups
       WHERE profile_id = ? AND date(eaten_at) = ?
       ORDER BY eaten_at ASC`,
    )
    .all(profileId, date)

  const selectItems = db.prepare(
    'SELECT id, name, kcal, protein_g, carbs_g, fat_g FROM meal_items WHERE group_id = ?',
  )
  return groups.map((group) => ({
    ...group,
    items: selectItems.all(group.id),
  }))
}

// GROUP BY date(eaten_at) here only ever produces a single group, since
// the WHERE clause already restricts to one date — kept for consistency
// with totalsByRange's identical query shape, one row per day.
export function totalsByDate(db, { profileId = DEFAULT_PROFILE_ID, date }) {
  const row = db
    .prepare(
      `SELECT
         SUM(mi.kcal) AS kcal,
         SUM(mi.protein_g) AS protein_g,
         SUM(mi.carbs_g) AS carbs_g,
         SUM(mi.fat_g) AS fat_g
       FROM meal_groups mg
       JOIN meal_items mi ON mi.group_id = mg.id
       WHERE mg.profile_id = ? AND date(mg.eaten_at) = ?
       GROUP BY date(mg.eaten_at)`,
    )
    .get(profileId, date)

  return row ?? EMPTY_TOTALS
}

export function totalsByRange(db, { profileId = DEFAULT_PROFILE_ID, from, to }) {
  return db
    .prepare(
      `SELECT
         date(mg.eaten_at) AS day,
         SUM(mi.kcal) AS kcal,
         SUM(mi.protein_g) AS protein_g,
         SUM(mi.carbs_g) AS carbs_g,
         SUM(mi.fat_g) AS fat_g
       FROM meal_groups mg
       JOIN meal_items mi ON mi.group_id = mg.id
       WHERE mg.profile_id = ? AND date(mg.eaten_at) BETWEEN ? AND ?
       GROUP BY date(mg.eaten_at)
       ORDER BY day ASC`,
    )
    .all(profileId, from, to)
}

export function removeLastGroup(db, { profileId = DEFAULT_PROFILE_ID }) {
  const lastGroup = db
    .prepare(
      `SELECT id FROM meal_groups WHERE profile_id = ?
       ORDER BY eaten_at DESC, id DESC LIMIT 1`,
    )
    .get(profileId)

  if (!lastGroup) {
    return null
  }

  db.prepare('DELETE FROM meal_groups WHERE id = ?').run(lastGroup.id)
  return { id: lastGroup.id }
}

export function clearDay(db, { profileId = DEFAULT_PROFILE_ID, date }) {
  const result = db
    .prepare('DELETE FROM meal_groups WHERE profile_id = ? AND date(eaten_at) = ?')
    .run(profileId, date)
  return { removedGroups: result.changes }
}
