import ScreenCard from '../../components/ScreenCard'
import type { Language } from '../../types/language'
import type { UserProfile } from '../../types/userProfile'
import type { DietStyle } from '../../services/calorieCalculator'
import {
  calculateDailyCalories,
  getDietStyle,
} from '../../services/calorieCalculator'
import { calculateMacros } from '../../services/macroCalculator'

type NutritionResultScreenProps = {
  language: Language
  profile: UserProfile
  onContinue: () => void
}

const DIET_STYLE_LABELS: Record<DietStyle, { pt: string; en: string }> = {
  cutting: { pt: 'Cutting', en: 'Cutting' },
  moderate: { pt: 'Moderada', en: 'Moderate' },
  bulking: { pt: 'Bulking', en: 'Bulking' },
}

function NutritionResultScreen({
  language,
  profile,
  onContinue,
}: NutritionResultScreenProps) {
  const calories = calculateDailyCalories(profile)
  const macros = calculateMacros(profile, calories)
  const dietStyle = getDietStyle(profile.goal)
  const isHormoneAdjusted = profile.hormoneUse === 'yes'

  return (
    <ScreenCard cardClassName="choice-card">
      <h1>
        {calories} {language === 'pt' ? 'kcal por dia' : 'kcal per day'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? `Estilo de dieta: ${DIET_STYLE_LABELS[dietStyle].pt}.`
          : `Diet style: ${DIET_STYLE_LABELS[dietStyle].en}.`}
      </p>

      {isHormoneAdjusted && (
        <>
          <p className="subtitle">
            {language === 'pt'
              ? 'Suas metas de proteína, calorias e água foram ajustadas por causa do uso de hormônios que você informou.'
              : 'Your protein, calorie and water targets were adjusted because of the hormone use you reported.'}
          </p>

          <p className="subtitle">
            {language === 'pt'
              ? 'Uso de hormônios pode alterar exames como hematócrito e colesterol. Isso é acompanhado com exame de sangue e um médico, não apenas com hidratação — mantenha o acompanhamento em dia.'
              : 'Hormone use can affect bloodwork like hematocrit and cholesterol. That is monitored with blood tests and a doctor, not hydration alone — keep your checkups current.'}
          </p>
        </>
      )}

      <div className="macro-grid">
        <div className="macro-item">
          <strong>{macros.proteinGrams}g</strong>
          <small>{language === 'pt' ? 'Proteína' : 'Protein'}</small>
        </div>

        <div className="macro-item">
          <strong>{macros.carbsGrams}g</strong>
          <small>{language === 'pt' ? 'Carboidratos' : 'Carbs'}</small>
        </div>

        <div className="macro-item">
          <strong>{macros.fatGrams}g</strong>
          <small>{language === 'pt' ? 'Gorduras' : 'Fat'}</small>
        </div>

        <div className="macro-item">
          <strong>{macros.fiberGrams}g</strong>
          <small>{language === 'pt' ? 'Fibras' : 'Fiber'}</small>
        </div>

        <div className="macro-item">
          <strong>{(macros.waterMl / 1000).toFixed(1)}L</strong>
          <small>{language === 'pt' ? 'Água' : 'Water'}</small>
        </div>
      </div>

      <p className="subtitle">
        {language === 'pt'
          ? `Priorize gorduras insaturadas (azeite, castanhas, abacate, peixes). Limite a gordura saturada a até ${macros.saturatedFatCapGrams}g.`
          : `Prioritize unsaturated fats (olive oil, nuts, avocado, fish). Keep saturated fat under ${macros.saturatedFatCapGrams}g.`}
      </p>

      <p className="subtitle">
        {language === 'pt'
          ? 'Uma estimativa inicial, não uma recomendação médica. Ajuste com acompanhamento profissional se necessário.'
          : 'An initial estimate, not medical advice. Adjust with professional guidance if needed.'}
      </p>

      <button className="primary-button" onClick={onContinue}>
        {language === 'pt' ? 'Ir para o chat' : 'Go to chat'}
      </button>
    </ScreenCard>
  )
}

export default NutritionResultScreen
