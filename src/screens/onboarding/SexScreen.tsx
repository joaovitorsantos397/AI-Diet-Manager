import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'
import type { Sex } from '../../types/sex'

type SexScreenProps = {
  language: Language
  selectedSex: Sex | null
  onSelect: (sex: Sex) => void
}

const SEX_OPTIONS: Array<{
  value: Sex
  label: { pt: string; en: string }
}> = [
  { value: 'female', label: { pt: 'Feminino', en: 'Female' } },
  { value: 'male', label: { pt: 'Masculino', en: 'Male' } },
]

function SexScreen({ language, selectedSex, onSelect }: SexScreenProps) {
  return (
    <ScreenCard cardClassName="choice-card">
      <h1>{language === 'pt' ? 'Qual é o seu sexo?' : 'What is your sex?'}</h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Usado para calcular suas necessidades calóricas com precisão.'
          : 'Used to calculate your calorie needs accurately.'}
      </p>

      <div className="choice-list">
        {SEX_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={
              option.value === selectedSex
                ? 'choice-button choice-button-selected'
                : 'choice-button'
            }
            onClick={() => onSelect(option.value)}
          >
            {option.label[language]}
          </button>
        ))}
      </div>
    </ScreenCard>
  )
}

export default SexScreen
