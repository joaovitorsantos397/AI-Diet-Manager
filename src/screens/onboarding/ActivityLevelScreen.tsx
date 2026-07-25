import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'
import type { ActivityLevel } from '../../types/activityLevel'

type ActivityLevelScreenProps = {
  language: Language
  selectedLevel: ActivityLevel | null
  onSelect: (level: ActivityLevel) => void
}

const ACTIVITY_OPTIONS: Array<{
  value: ActivityLevel
  label: { pt: string; en: string }
  description: { pt: string; en: string }
}> = [
  {
    value: 'sedentary',
    label: { pt: 'Sedentário', en: 'Sedentary' },
    description: {
      pt: 'Pouco ou nenhum exercício',
      en: 'Little or no exercise',
    },
  },
  {
    value: 'light',
    label: { pt: 'Leve', en: 'Light' },
    description: {
      pt: 'Exercício leve, 1 a 3 dias por semana',
      en: 'Light exercise, 1-3 days a week',
    },
  },
  {
    value: 'moderate',
    label: { pt: 'Moderado', en: 'Moderate' },
    description: {
      pt: 'Exercício moderado, 3 a 5 dias por semana',
      en: 'Moderate exercise, 3-5 days a week',
    },
  },
  {
    value: 'active',
    label: { pt: 'Ativo', en: 'Active' },
    description: {
      pt: 'Exercício intenso, 6 a 7 dias por semana',
      en: 'Hard exercise, 6-7 days a week',
    },
  },
  {
    value: 'very_active',
    label: { pt: 'Muito ativo', en: 'Very active' },
    description: {
      pt: 'Exercício muito intenso e trabalho físico',
      en: 'Very hard exercise and a physical job',
    },
  },
]

function ActivityLevelScreen({
  language,
  selectedLevel,
  onSelect,
}: ActivityLevelScreenProps) {
  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {language === 'pt'
          ? 'Qual é o seu nível de atividade?'
          : 'What is your activity level?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Usado para estimar seu gasto calórico diário.'
          : 'Used to estimate your daily calorie expenditure.'}
      </p>

      <div className="choice-list">
        {ACTIVITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={
              option.value === selectedLevel
                ? 'choice-button choice-button-selected'
                : 'choice-button'
            }
            onClick={() => onSelect(option.value)}
          >
            <span>
              <strong>{option.label[language]}</strong>
              <small>{option.description[language]}</small>
            </span>
          </button>
        ))}
      </div>
    </ScreenCard>
  )
}

export default ActivityLevelScreen
