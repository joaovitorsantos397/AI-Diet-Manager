import { useState } from 'react'
import type { FormEvent } from 'react'
import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'

type AgeScreenProps = {
  language: Language
  value: number | null
  onSubmit: (age: number) => void
}

const MIN_AGE = 13
const MAX_AGE = 120

function AgeScreen({ language, value, onSubmit }: AgeScreenProps) {
  const [input, setInput] = useState(value !== null ? String(value) : '')

  const parsed = Number(input)
  const isValid =
    input.trim() !== '' &&
    Number.isInteger(parsed) &&
    parsed >= MIN_AGE &&
    parsed <= MAX_AGE

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isValid) {
      onSubmit(parsed)
    }
  }

  return (
    <ScreenCard cardClassName="choice-card">
      <h1>{language === 'pt' ? 'Qual é a sua idade?' : 'What is your age?'}</h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Usada junto com o sexo para calcular suas necessidades calóricas.'
          : 'Used together with sex to calculate your calorie needs.'}
      </p>

      <form className="field-form" onSubmit={handleSubmit}>
        <input
          type="number"
          inputMode="numeric"
          min={MIN_AGE}
          max={MAX_AGE}
          className="field-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={language === 'pt' ? 'Anos' : 'Years'}
          aria-label={
            language === 'pt' ? 'Qual é a sua idade?' : 'What is your age?'
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

export default AgeScreen
