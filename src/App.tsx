import { useState } from 'react'
import './App.css'

type Language = 'pt' | 'en'

function App() {
  const [language, setLanguage] = useState<Language | null>(null)

  if (language === null) {
    return (
      <main className="app">
        <section className="language-card">
          <p className="eyebrow">AI Diet Manager</p>

          <h1>Escolha seu idioma</h1>

          <p className="subtitle">
            Choose your preferred language to continue.
          </p>

          <div className="language-options">
            <button
              className="language-button"
              onClick={() => setLanguage('pt')}
            >
              <span className="flag">🇧🇷</span>

              <span>
                <strong>Português</strong>
                <small>Continuar em português</small>
              </span>
            </button>

            <button
              className="language-button"
              onClick={() => setLanguage('en')}
            >
              <span className="flag">🇺🇸</span>

              <span>
                <strong>English</strong>
                <small>Continue in English</small>
              </span>
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="welcome-card">
        <p className="eyebrow">AI Diet Manager</p>

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

        <button className="primary-button">
          {language === 'pt' ? 'Começar' : 'Get Started'}
        </button>

        <button
          className="text-button"
          onClick={() => setLanguage(null)}
        >
          {language === 'pt' ? 'Alterar idioma' : 'Change language'}
        </button>
      </section>
    </main>
  )
}

export default App