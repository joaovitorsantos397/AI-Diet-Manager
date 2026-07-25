import { useState } from 'react'
import type { FormEvent } from 'react'
import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'

type NameScreenProps = {
  language: Language
  value: string | null
  onSubmit: (name: string) => void
}

function NameScreen({ language, value, onSubmit }: NameScreenProps) {
  const [input, setInput] = useState(value ?? '')

  const isValid = input.trim() !== ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isValid) {
      onSubmit(input.trim())
    }
  }

  return (
    <ScreenCard cardClassName="choice-card">
      <h1>{language === 'pt' ? 'Qual é o seu nome?' : 'What is your name?'}</h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'É assim que seu coach vai te chamar.'
          : "This is how your coach will address you."}
      </p>

      <form className="field-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="field-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={language === 'pt' ? 'Seu nome' : 'Your name'}
          aria-label={
            language === 'pt' ? 'Qual é o seu nome?' : 'What is your name?'
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

export default NameScreen
