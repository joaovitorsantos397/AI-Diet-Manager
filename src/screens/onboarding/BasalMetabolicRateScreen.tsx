import { useState } from 'react'
import type { FormEvent } from 'react'
import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'

type BasalMetabolicRateScreenProps = {
  language: Language
  value: number | null
  onSubmit: (basalMetabolicRate: number) => void
  onSkip: () => void
}

const MIN_BMR = 800
const MAX_BMR = 4000

function BasalMetabolicRateScreen({
  language,
  value,
  onSubmit,
  onSkip,
}: BasalMetabolicRateScreenProps) {
  const [input, setInput] = useState(value !== null ? String(value) : '')

  const parsed = Number(input)
  const isValid =
    input.trim() !== '' &&
    Number.isFinite(parsed) &&
    parsed >= MIN_BMR &&
    parsed <= MAX_BMR

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isValid) {
      onSubmit(parsed)
    }
  }

  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {language === 'pt'
          ? 'Sabe sua taxa metabólica basal?'
          : 'Do you know your basal metabolic rate?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Se você já mediu numa balança de bioimpedância, esse número é mais preciso que nossa estimativa por fórmula. Se não souber, pode pular.'
          : "If you've measured it on a bioimpedance scale, this number is more accurate than our formula-based estimate. If you don't know it, you can skip."}
      </p>

      <form className="field-form" onSubmit={handleSubmit}>
        <input
          type="number"
          inputMode="numeric"
          min={MIN_BMR}
          max={MAX_BMR}
          className="field-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={language === 'pt' ? 'kcal por dia' : 'kcal per day'}
          aria-label={
            language === 'pt'
              ? 'Taxa metabólica basal em kcal por dia'
              : 'Basal metabolic rate in kcal per day'
          }
          autoFocus
        />

        <button type="submit" className="primary-button" disabled={!isValid}>
          {language === 'pt' ? 'Continuar' : 'Continue'}
        </button>
      </form>

      <button className="text-button" onClick={onSkip}>
        {language === 'pt' ? 'Não sei / pular' : "I don't know / skip"}
      </button>
    </ScreenCard>
  )
}

export default BasalMetabolicRateScreen
