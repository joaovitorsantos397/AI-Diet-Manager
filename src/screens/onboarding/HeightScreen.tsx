import { useState } from 'react'
import type { FormEvent } from 'react'
import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'

type HeightScreenProps = {
  language: Language
  value: number | null
  onSubmit: (height: number) => void
}

const MIN_HEIGHT_CM = 100
const MAX_HEIGHT_CM = 250

function HeightScreen({ language, value, onSubmit }: HeightScreenProps) {
  const [input, setInput] = useState(value !== null ? String(value) : '')

  const parsed = Number(input)
  const isValid =
    input.trim() !== '' &&
    Number.isInteger(parsed) &&
    parsed >= MIN_HEIGHT_CM &&
    parsed <= MAX_HEIGHT_CM

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isValid) {
      onSubmit(parsed)
    }
  }

  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {language === 'pt' ? 'Qual é a sua altura?' : 'What is your height?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Em centímetros. Usada no cálculo das suas necessidades calóricas.'
          : 'In centimeters. Used to calculate your calorie needs.'}
      </p>

      <form className="field-form" onSubmit={handleSubmit}>
        <input
          type="number"
          inputMode="numeric"
          min={MIN_HEIGHT_CM}
          max={MAX_HEIGHT_CM}
          className="field-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={language === 'pt' ? 'Centímetros' : 'Centimeters'}
          aria-label={
            language === 'pt' ? 'Qual é a sua altura?' : 'What is your height?'
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

export default HeightScreen
