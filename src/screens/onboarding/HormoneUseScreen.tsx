import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'
import type { HormoneUse } from '../../types/hormoneUse'

type HormoneUseScreenProps = {
  language: Language
  selectedValue: HormoneUse | null
  onSelect: (value: HormoneUse) => void
}

const HORMONE_OPTIONS: Array<{
  value: HormoneUse
  label: { pt: string; en: string }
}> = [
  { value: 'yes', label: { pt: 'Sim', en: 'Yes' } },
  { value: 'no', label: { pt: 'Não', en: 'No' } },
]

function HormoneUseScreen({
  language,
  selectedValue,
  onSelect,
}: HormoneUseScreenProps) {
  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {language === 'pt'
          ? 'Você faz uso de esteroides/anabolizantes para hipertrofia?'
          : 'Do you use steroids/anabolic compounds for hypertrophy?'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Pergunta opcional. Isso ajuda a IA a dar alertas de saúde mais específicos, como sobre alimentos que podem afetar o colesterol. Você não precisa responder.'
          : 'Optional question. This helps the AI give more specific health alerts, like about foods that may affect cholesterol. You do not have to answer.'}
      </p>

      <div className="choice-list">
        {HORMONE_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={
              option.value === selectedValue
                ? 'choice-button choice-button-selected'
                : 'choice-button'
            }
            onClick={() => onSelect(option.value)}
          >
            {option.label[language]}
          </button>
        ))}
      </div>

      <button className="text-button" onClick={() => onSelect('skipped')}>
        {language === 'pt' ? 'Prefiro não responder' : 'Prefer not to say'}
      </button>
    </ScreenCard>
  )
}

export default HormoneUseScreen
