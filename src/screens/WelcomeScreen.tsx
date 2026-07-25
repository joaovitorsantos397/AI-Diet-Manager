import ScreenCard from '../components/ScreenCard'
import type { Language } from '../types/language'

type WelcomeScreenProps = {
  language: Language
  onChangeLanguage: () => void
  onStart: () => void
}

function WelcomeScreen({
  language,
  onChangeLanguage,
  onStart,
}: WelcomeScreenProps) {
  return (
    <ScreenCard cardClassName="welcome-card">
      <h1>
        {language === 'pt'
          ? 'Seu coach pessoal de nutrição com IA.'
          : 'Your personal AI nutrition coach.'}
      </h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Alimente-se melhor. Mantenha a consistência. Uma refeição de cada vez.'
          : 'Eat better. Stay consistent. One meal at a time.'}
      </p>

      <button className="primary-button" onClick={onStart}>
        {language === 'pt' ? 'Começar' : 'Get Started'}
      </button>

      <button className="text-button" onClick={onChangeLanguage}>
        {language === 'pt' ? 'Alterar idioma' : 'Change language'}
      </button>
    </ScreenCard>
  )
}

export default WelcomeScreen
