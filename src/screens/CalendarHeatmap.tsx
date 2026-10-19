import { useState } from 'react'
import './CalendarHeatmap.css'
import type { Language } from '../types/language'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'
import type { FeedbackLevel } from '../types/feedback'
import { classifyStatus, getTotalsForDay } from '../services/nutritionLog'
import { isSameDay } from '../utils/date'

type CalendarHeatmapProps = {
  language: Language
  nutritionLog: NutritionLogEntry[]
  targetCalories: number
  targetProtein: number
}

type DayCell = {
  date: Date | null
  status: FeedbackLevel | null
  hasEntries: boolean
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// A day's overall status combines calories AND protein (same rule as the
// adherence streak), rather than just calories like the daily bar chart —
// a single glance at the calendar should reflect the whole plan, not one
// metric.
function combinedDayStatus(
  log: NutritionLogEntry[],
  date: Date,
  targetCalories: number,
  targetProtein: number,
): { status: FeedbackLevel | null; hasEntries: boolean } {
  const hasEntries = log.some((entry) =>
    isSameDay(new Date(entry.timestamp), date),
  )
  if (!hasEntries) {
    return { status: null, hasEntries: false }
  }

  const totals = getTotalsForDay(log, date)
  const caloriesStatus = classifyStatus(totals.calories, targetCalories)
  const proteinStatus = classifyStatus(totals.proteinGrams, targetProtein)

  if (caloriesStatus === 'green' && proteinStatus === 'green') {
    return { status: 'green', hasEntries: true }
  }
  if (caloriesStatus === 'red' || proteinStatus === 'red') {
    return { status: 'red', hasEntries: true }
  }
  return { status: 'yellow', hasEntries: true }
}

function CalendarHeatmap({
  language,
  nutritionLog,
  targetCalories,
  targetProtein,
}: CalendarHeatmapProps) {
  const today = new Date()
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = monthCursor.getFullYear()
  const month = monthCursor.getMonth()
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: DayCell[] = []
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ date: null, status: null, hasEntries: false })
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, month, d)
    const isToday = isSameDay(date, today)
    const isFuture = date.getTime() > today.getTime() && !isToday
    const { status, hasEntries } = combinedDayStatus(
      nutritionLog,
      date,
      targetCalories,
      targetProtein,
    )
    cells.push({
      // Today is still in progress, so it's never fairly graded green/
      // yellow/red — but it can still have real entries and must stay
      // clickable, or there'd be no way to inspect today's own log (the
      // exact day someone debugging today's counter needs to open).
      date,
      status: isToday || isFuture ? null : status,
      hasEntries: isFuture ? false : hasEntries,
    })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, status: null, hasEntries: false })
  }

  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    // Jan 4, 1970 was a Sunday — a stable reference to name each weekday.
    const reference = new Date(1970, 0, 4 + i)
    return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      weekday: 'narrow',
    }).format(reference)
  })

  const monthLabel = new Intl.DateTimeFormat(
    language === 'pt' ? 'pt-BR' : 'en-US',
    { month: 'long', year: 'numeric' },
  ).format(monthCursor)

  const selectedDayEntries = selectedDate
    ? nutritionLog
        .filter((entry) => isSameDay(new Date(entry.timestamp), selectedDate))
        .sort((a, b) => a.timestamp - b.timestamp)
    : []
  const selectedDayTotals = selectedDate
    ? getTotalsForDay(nutritionLog, selectedDate)
    : null

  function goToPreviousMonth() {
    setSelectedDate(null)
    setMonthCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    )
  }

  function goToNextMonth() {
    setSelectedDate(null)
    setMonthCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    )
  }

  return (
    <div className="calendar-heatmap">
      <div className="calendar-heatmap-nav">
        <button
          type="button"
          className="chat-icon-button"
          onClick={goToPreviousMonth}
          aria-label={language === 'pt' ? 'Mês anterior' : 'Previous month'}
        >
          ‹
        </button>
        <strong className="calendar-heatmap-month">{monthLabel}</strong>
        <button
          type="button"
          className="chat-icon-button"
          onClick={goToNextMonth}
          aria-label={language === 'pt' ? 'Próximo mês' : 'Next month'}
        >
          ›
        </button>
      </div>

      <div className="calendar-heatmap-weekdays">
        {weekdayLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="calendar-heatmap-grid">
        {cells.map((cell, index) =>
          cell.date ? (
            <button
              type="button"
              key={cell.date.toISOString()}
              className={
                selectedDate && isSameDay(cell.date, selectedDate)
                  ? 'calendar-heatmap-day calendar-heatmap-day-selected'
                  : 'calendar-heatmap-day'
              }
              onClick={() =>
                setSelectedDate((current) =>
                  current && cell.date && isSameDay(current, cell.date)
                    ? null
                    : cell.date,
                )
              }
              disabled={!cell.hasEntries}
            >
              <span>{cell.date.getDate()}</span>
              {cell.status && (
                <span
                  className={`evolution-status-dot evolution-status-dot-${cell.status}`}
                  aria-hidden="true"
                />
              )}
            </button>
          ) : (
            <span
              key={`empty-${index}`}
              className="calendar-heatmap-day-empty"
            />
          ),
        )}
      </div>

      {selectedDate && (
        <div className="calendar-heatmap-detail">
          <strong>
            {new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(selectedDate)}
          </strong>
          {selectedDayEntries.length > 0 ? (
            <>
              <ul className="calendar-heatmap-meals">
                {selectedDayEntries.map((entry) => (
                  <li key={entry.id}>
                    <span>[{entry.mealTime || '?'}]</span>{' '}
                    {entry.description || 'meal'} — {entry.calories}kcal,{' '}
                    {entry.proteinGrams}g
                  </li>
                ))}
              </ul>
              <p className="calendar-heatmap-total">
                {language === 'pt' ? 'Total do dia:' : 'Day total:'}{' '}
                {selectedDayTotals!.calories}kcal ·{' '}
                {selectedDayTotals!.proteinGrams}g{' '}
                {language === 'pt' ? 'proteína' : 'protein'}
              </p>
            </>
          ) : (
            <p className="evolution-empty-hint">
              {language === 'pt'
                ? 'Nada registrado nesse dia.'
                : 'Nothing logged that day.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarHeatmap
