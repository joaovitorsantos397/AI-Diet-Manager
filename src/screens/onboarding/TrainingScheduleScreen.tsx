import { useState } from 'react'
import type { FormEvent } from 'react'
import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'

type TrainingScheduleScreenProps = {
  language: Language
  value: string | null
  onSubmit: (schedule: string) => void
}

function TrainingScheduleScreen({
  language,
  value,
  onSubmit,
}: TrainingScheduleScreenProps) {
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
      <h1>
        {language === 'pt'
          ? 'Quais dias e horários você treina?'
          : 'Which days and times do you train?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Breve descrição basta — ex: "Segunda, quarta e sexta, 19h".'
          : 'A brief description is enough — e.g. "Monday, Wednesday and Friday, 7pm".'}
      </p>

      <form className="field-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="field-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            language === 'pt'
              ? 'Ex: Seg/Qua/Sex às 19h'
              : 'E.g. Mon/Wed/Fri at 7pm'
          }
          aria-label={
            language === 'pt'
              ? 'Quais dias e horários você treina?'
              : 'Which days and times do you train?'
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

export default TrainingScheduleScreen
