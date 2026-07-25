import { useState } from 'react'
import type { FormEvent } from 'react'
import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'

type WeightScreenProps = {
  language: Language
  value: number | null
  onSubmit: (weight: number) => void
}

const MIN_WEIGHT_KG = 30
const MAX_WEIGHT_KG = 300

function WeightScreen({ language, value, onSubmit }: WeightScreenProps) {
  const [input, setInput] = useState(value !== null ? String(value) : '')

  const parsed = Number(input)
  const isValid =
    input.trim() !== '' &&
    Number.isFinite(parsed) &&
    parsed >= MIN_WEIGHT_KG &&
    parsed <= MAX_WEIGHT_KG

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isValid) {
      onSubmit(parsed)
    }
  }

  return (
    <ScreenCard cardClassName="choice-card">
      <h1>{language === 'pt' ? 'Qual é o seu peso?' : 'What is your weight?'}</h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Em quilos. Usado no cálculo das suas necessidades calóricas.'
          : 'In kilograms. Used to calculate your calorie needs.'}
      </p>

      <form className="field-form" onSubmit={handleSubmit}>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min={MIN_WEIGHT_KG}
          max={MAX_WEIGHT_KG}
          className="field-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={language === 'pt' ? 'Quilos' : 'Kilograms'}
          aria-label={
            language === 'pt' ? 'Qual é o seu peso?' : 'What is your weight?'
          }
          autoFocus
        />

        <button type="submit" className="primary-button" disabled={!isValid}>
          {language === 'pt' ? 'Continuar' : 'Continue'}
        </button>
      </form>
    </ScreenCard>
  )
}

export default WeightScreen
