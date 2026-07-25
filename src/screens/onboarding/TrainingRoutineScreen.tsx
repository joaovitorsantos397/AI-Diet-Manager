import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'
import type { TrainingRoutine } from '../../types/trainingRoutine'

type TrainingRoutineScreenProps = {
  language: Language
  selectedRoutine: TrainingRoutine | null
  onSelect: (routine: TrainingRoutine) => void
}

const TRAINING_ROUTINE_OPTIONS: Array<{
  value: TrainingRoutine
  label: { pt: string; en: string }
  description: { pt: string; en: string }
}> = [
  {
    value: 'fixed',
    label: {
      pt: 'Tenho dias e horários fixos',
      en: 'I have fixed days and times',
    },
    description: {
      pt: 'Treino sempre nos mesmos dias/horários da semana',
      en: 'I train on the same days/times every week',
    },
  },
  {
    value: 'flexible',
    label: { pt: 'Minha rotina é flexível', en: 'My routine is flexible' },
    description: {
      pt: 'Prefiro avisar o coach no dia, pelo chat',
      en: "I'd rather tell the coach day by day, in chat",
    },
  },
]

function TrainingRoutineScreen({
  language,
  selectedRoutine,
  onSelect,
}: TrainingRoutineScreenProps) {
  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {language === 'pt'
          ? 'Sua rotina de treino é fixa ou flexível?'
          : 'Is your training routine fixed or flexible?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Isso ajuda o coach a alinhar suas refeições com o horário do treino.'
          : 'This helps the coach align your meals with your workout time.'}
      </p>

      <div className="choice-list">
        {TRAINING_ROUTINE_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={
              option.value === selectedRoutine
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

export default TrainingRoutineScreen
