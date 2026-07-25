import { useState } from 'react'
import type { FormEvent } from 'react'
import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'

type BodyFatScreenProps = {
  language: Language
  value: number | null
  onSubmit: (bodyFatPercentage: number) => void
  onSkip: () => void
}

const MIN_BODY_FAT = 3
const MAX_BODY_FAT = 60

function BodyFatScreen({
  language,
  value,
  onSubmit,
  onSkip,
}: BodyFatScreenProps) {
  const [input, setInput] = useState(value !== null ? String(value) : '')

  const parsed = Number(input)
  const isValid =
    input.trim() !== '' &&
    Number.isFinite(parsed) &&
    parsed >= MIN_BODY_FAT &&
    parsed <= MAX_BODY_FAT

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
          ? 'Qual é o seu percentual de gordura atual?'
          : 'What is your current body fat percentage?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Se você não souber, pode pular e medir depois — muitas farmácias fazem bioimpedância.'
          : "If you don't know, you can skip and measure it later — many pharmacies offer a bioimpedance scan."}
      </p>

      <form className="field-form" onSubmit={handleSubmit}>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min={MIN_BODY_FAT}
          max={MAX_BODY_FAT}
          className="field-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={language === 'pt' ? 'Percentual (%)' : 'Percentage (%)'}
          aria-label={
            language === 'pt'
              ? 'Qual é o seu percentual de gordura atual?'
              : 'What is your current body fat percentage?'
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

export default BodyFatScreen
