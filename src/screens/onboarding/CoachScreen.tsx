import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'
import type { CoachId } from '../../types/coach'
import { COACHES } from '../../data/coaches'

type CoachScreenProps = {
  language: Language
  selectedCoach: CoachId | null
  onSelect: (coach: CoachId) => void
}

function CoachScreen({ language, selectedCoach, onSelect }: CoachScreenProps) {
  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {language === 'pt'
          ? 'Escolha o tom do seu coach'
          : 'Choose your coach'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Você pode trocar depois. Todos têm o mesmo objetivo, só mudam a forma de falar com você.'
          : 'You can change this later. They all share the same goal — just a different way of talking to you.'}
      </p>

      <div className="choice-list">
        {COACHES.map((option) => (
          <button
            key={option.value}
            className={
              option.value === selectedCoach
                ? 'choice-button choice-button-selected'
                : 'choice-button'
            }
            onClick={() => onSelect(option.value)}
          >
            <span className="option-icon" aria-hidden="true">
              {option.icon}
            </span>

            <span>
              <strong>{option.name[language]}</strong>
              <small>{option.tagline[language]}</small>
            </span>
          </button>
        ))}
      </div>
    </ScreenCard>
  )
}

export default CoachScreen
