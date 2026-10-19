import { useState } from 'react'
import './EvolutionScreen.css'
import type { Language } from '../types/language'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'
import type { WeightLogEntry } from '../types/weightLogEntry'
import {
  getAdherenceStreakDays,
  getDailySeries,
  getWeeklySeries,
} from '../services/nutritionLog'
import type { DailySummary } from '../services/nutritionLog'
import { getRecentWeightEntries } from '../services/weightLog'
import CalendarHeatmap from './CalendarHeatmap'

type EvolutionScreenProps = {
  language: Language
  nutritionLog: NutritionLogEntry[]
  weightLog: WeightLogEntry[]
  targetCalories: number
  targetProtein: number
  onClose: () => void
}

type ChartPeriod = 'days' | 'weeks'

const DAYS_TO_SHOW = 7
const WEEKS_TO_SHOW = 8
const WEIGHT_ENTRIES_TO_SHOW = 8
const PLOT_HEIGHT_PX = 140

function formatDayLabel(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    weekday: 'short',
  }).format(date)
}

function formatWeekLabel(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function formatWeightDateLabel(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

type WeightChartProps = {
  language: Language
  entries: WeightLogEntry[]
}

function WeightChart({ language, entries }: WeightChartProps) {
  const weights = entries.map((entry) => entry.weightKg)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min

  return (
    <div className="evolution-chart">
      <div
        className="evolution-plot"
        style={{ height: `${PLOT_HEIGHT_PX}px` }}
      >
        {entries.map((entry) => {
          const heightPercent =
            range > 0 ? 20 + ((entry.weightKg - min) / range) * 80 : 60
          const date = new Date(entry.timestamp)
          const title = `${formatWeightDateLabel(date, language)}: ${entry.weightKg}kg${
            entry.bodyFatPercentage !== null
              ? ` · ${entry.bodyFatPercentage}% ${language === 'pt' ? 'gordura' : 'body fat'}`
              : ''
          }`

          return (
            <div key={entry.id} className="evolution-bar-track">
              <div
                className="evolution-bar evolution-bar-weight"
                style={{ height: `${heightPercent}%` }}
                title={title}
              />
            </div>
          )
        })}
      </div>

      <div className="evolution-labels">
        {entries.map((entry) => (
          <span key={entry.id} className="evolution-bar-label">
            {formatWeightDateLabel(new Date(entry.timestamp), language)}
          </span>
        ))}
      </div>
    </div>
  )
}

type MiniBarChartProps = {
  language: Language
  series: DailySummary[]
  target: number
  max: number
  valueOf: (day: DailySummary) => number
  formatTitle: (day: DailySummary) => string
  formatLabel?: (date: Date, language: Language) => string
  barClassName?: string
  showStatus?: boolean
}

function MiniBarChart({
  language,
  series,
  target,
  max,
  valueOf,
  formatTitle,
  formatLabel = formatDayLabel,
  barClassName,
  showStatus,
}: MiniBarChartProps) {
  return (
    <div className="evolution-chart">
      <div
        className="evolution-plot"
        style={{ height: `${PLOT_HEIGHT_PX}px` }}
      >
        <div
          className="evolution-target-line"
          style={{ bottom: `${max > 0 ? (target / max) * 100 : 0}%` }}
        />
        {series.map((day) => (
          <div key={day.date.toISOString()} className="evolution-bar-track">
            <div
              className={
                barClassName ? `evolution-bar ${barClassName}` : 'evolution-bar'
              }
              style={{
                height: `${max > 0 ? (valueOf(day) / max) * 100 : 0}%`,
              }}
              title={formatTitle(day)}
            >
              {showStatus && day.status && (
                <span
                  className={`evolution-status-dot evolution-status-dot-${day.status}`}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="evolution-labels">
        {series.map((day) => (
          <span key={day.date.toISOString()} className="evolution-bar-label">
            {formatLabel(day.date, language)}
          </span>
        ))}
      </div>
    </div>
  )
}

function EvolutionScreen({
  language,
  nutritionLog,
  weightLog,
  targetCalories,
  targetProtein,
  onClose,
}: EvolutionScreenProps) {
  const [showTable, setShowTable] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('days')
  const [showFullWeightHistory, setShowFullWeightHistory] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const series =
    chartPeriod === 'days'
      ? getDailySeries(nutritionLog, targetCalories, DAYS_TO_SHOW)
      : getWeeklySeries(nutritionLog, targetCalories, WEEKS_TO_SHOW)
  const formatLabel = chartPeriod === 'days' ? formatDayLabel : formatWeekLabel
  const periodTarget =
    chartPeriod === 'days' ? targetCalories : targetCalories * 7
  const periodProteinTarget =
    chartPeriod === 'days' ? targetProtein : targetProtein * 7

  const recentWeightEntries = getRecentWeightEntries(
    weightLog,
    WEIGHT_ENTRIES_TO_SHOW,
  )
  const weightEntriesToShow = showFullWeightHistory
    ? weightLog
    : recentWeightEntries
  const streakDays = getAdherenceStreakDays(
    nutritionLog,
    targetCalories,
    targetProtein,
  )

  const maxCalories = Math.max(
    periodTarget,
    ...series.map((day) => day.totals.calories),
  )
  const maxProtein = Math.max(
    periodProteinTarget,
    ...series.map((day) => day.totals.proteinGrams),
  )

  return (
    <div className="evolution">
      <header className="evolution-header">
        <button
          type="button"
          className="chat-icon-button"
          onClick={onClose}
          aria-label={language === 'pt' ? 'Voltar ao chat' : 'Back to chat'}
        >
          ←
        </button>
        <strong>{language === 'pt' ? 'Evolução' : 'Evolution'}</strong>
        <button
          type="button"
          className="chat-icon-button evolution-calendar-toggle"
          onClick={() => setShowCalendar((current) => !current)}
          aria-label={
            language === 'pt' ? 'Abrir calendário' : 'Open calendar'
          }
          aria-pressed={showCalendar}
        >
          📅
        </button>
      </header>

      <div className="evolution-content">
        <div className="evolution-streak">
          {streakDays > 0 ? (
            <>
              <span className="evolution-streak-flame" aria-hidden="true">
                🔥
              </span>
              <span>
                {language === 'pt'
                  ? `${streakDays} ${streakDays === 1 ? 'dia seguido' : 'dias seguidos'} na meta`
                  : `${streakDays} day${streakDays === 1 ? '' : 's'} in a row on target`}
              </span>
            </>
          ) : (
            <span className="evolution-streak-empty">
              {language === 'pt'
                ? 'Nenhum streak ativo — bata calorias e proteína hoje pra começar um.'
                : 'No active streak — hit calories and protein today to start one.'}
            </span>
          )}
        </div>

        {showCalendar && (
          <section className="evolution-chart-card">
            <CalendarHeatmap
              language={language}
              nutritionLog={nutritionLog}
              targetCalories={targetCalories}
              targetProtein={targetProtein}
            />
          </section>
        )}

        <div
          className="evolution-period-toggle"
          role="group"
          aria-label={
            language === 'pt' ? 'Período do gráfico' : 'Chart period'
          }
        >
          <button
            type="button"
            className={
              chartPeriod === 'days'
                ? 'text-button text-button-active'
                : 'text-button'
            }
            onClick={() => setChartPeriod('days')}
            aria-pressed={chartPeriod === 'days'}
          >
            {language === 'pt' ? 'Dias' : 'Days'}
          </button>
          <button
            type="button"
            className={
              chartPeriod === 'weeks'
                ? 'text-button text-button-active'
                : 'text-button'
            }
            onClick={() => setChartPeriod('weeks')}
            aria-pressed={chartPeriod === 'weeks'}
          >
            {language === 'pt' ? 'Semanas' : 'Weeks'}
          </button>
        </div>

        <section className="evolution-chart-card">
          <h2>{language === 'pt' ? 'Calorias' : 'Calories'}</h2>
          <MiniBarChart
            language={language}
            series={series}
            target={periodTarget}
            max={maxCalories}
            valueOf={(day) => day.totals.calories}
            formatTitle={(day) =>
              `${formatLabel(day.date, language)}: ${day.totals.calories} kcal`
            }
            formatLabel={formatLabel}
            showStatus
          />
        </section>

        <section className="evolution-chart-card">
          <h2>{language === 'pt' ? 'Proteína' : 'Protein'}</h2>
          <MiniBarChart
            language={language}
            series={series}
            target={periodProteinTarget}
            max={maxProtein}
            valueOf={(day) => day.totals.proteinGrams}
            formatTitle={(day) =>
              `${formatLabel(day.date, language)}: ${day.totals.proteinGrams}g`
            }
            formatLabel={formatLabel}
            barClassName="evolution-bar-protein"
          />
        </section>

        <section className="evolution-chart-card">
          <div className="evolution-chart-card-header">
            <h2>{language === 'pt' ? 'Peso' : 'Weight'}</h2>
            {weightLog.length > WEIGHT_ENTRIES_TO_SHOW && (
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setShowFullWeightHistory((current) => !current)
                }
              >
                {showFullWeightHistory
                  ? language === 'pt'
                    ? 'Ver recentes'
                    : 'Show recent'
                  : language === 'pt'
                    ? 'Ver histórico completo'
                    : 'Show full history'}
              </button>
            )}
          </div>
          {weightEntriesToShow.length > 0 ? (
            <WeightChart language={language} entries={weightEntriesToShow} />
          ) : (
            <p className="evolution-empty-hint">
              {language === 'pt'
                ? 'Nenhuma pesagem registrada ainda — conte pro seu coach quando pesar ou medir a bioimpedância.'
                : "No weigh-ins logged yet — tell your coach when you weigh in or measure body composition."}
            </p>
          )}
        </section>

        <div className="evolution-legend">
          <span>
            <span className="evolution-status-dot evolution-status-dot-green" />
            {language === 'pt' ? 'na meta' : 'on target'}
          </span>
          <span>
            <span className="evolution-status-dot evolution-status-dot-yellow" />
            {language === 'pt' ? 'atenção' : 'caution'}
          </span>
          <span>
            <span className="evolution-status-dot evolution-status-dot-red" />
            {language === 'pt' ? 'fora da meta' : 'off target'}
          </span>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => setShowTable((current) => !current)}
        >
          {showTable
            ? language === 'pt'
              ? 'Ocultar tabela'
              : 'Hide table'
            : language === 'pt'
              ? 'Ver como tabela'
              : 'View as table'}
        </button>

        {showTable && (
          <table className="evolution-table">
            <thead>
              <tr>
                <th>{language === 'pt' ? 'Dia' : 'Day'}</th>
                <th>kcal</th>
                <th>{language === 'pt' ? 'Proteína' : 'Protein'}</th>
              </tr>
            </thead>
            <tbody>
              {series.map((day) => (
                <tr key={day.date.toISOString()}>
                  <td>{formatDayLabel(day.date, language)}</td>
                  <td>{day.hasEntries ? day.totals.calories : '—'}</td>
                  <td>{day.hasEntries ? `${day.totals.proteinGrams}g` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default EvolutionScreen
