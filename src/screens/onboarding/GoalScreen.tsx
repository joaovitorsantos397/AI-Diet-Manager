import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'
import type { Goal } from '../../types/goal'

type GoalScreenProps = {
  language: Language
  selectedGoal: Goal | null
  onSelect: (goal: Goal) => void
}

const GOAL_OPTIONS: Array<{
  value: Goal
  label: { pt: string; en: string }
  description: { pt: string; en: string }
}> = [
  {
    value: 'lose',
    label: { pt: 'Emagrecimento', en: 'Weight loss' },
    description: {
      pt: 'Perder gordura, foco em definição',
      en: 'Lose fat, focus on definition',
    },
  },
  {
    value: 'maintain',
    label: { pt: 'Manutenção', en: 'Maintenance' },
    description: {
      pt: 'Manter o peso e a composição atual',
      en: 'Keep current weight and composition',
    },
  },
  {
    value: 'lean_gain',
    label: { pt: 'Ganho de massa magra', en: 'Lean muscle gain' },
    description: {
      pt: 'Ganhar músculo com o mínimo de gordura possível',
      en: 'Build muscle while minimizing fat gain',
    },
  },
  {
    value: 'aggressive_gain',
    label: { pt: 'Bulking', en: 'Bulking' },
    description: {
      pt: 'Priorizar ganho de músculo, aceitando ganhar um pouco de gordura',
      en: 'Prioritize muscle gain, accepting some fat gain',
    },
  },
]

function GoalScreen({ language, selectedGoal, onSelect }: GoalScreenProps) {
  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {language === 'pt' ? 'Qual é o seu objetivo?' : 'What is your goal?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Isso ajuda o coach a personalizar suas recomendações.'
          : 'This helps the coach personalize your recommendations.'}
      </p>

      <div className="choice-list">
        {GOAL_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={
              option.value === selectedGoal
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

export default GoalScreen
