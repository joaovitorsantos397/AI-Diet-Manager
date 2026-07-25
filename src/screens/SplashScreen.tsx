import { useEffect } from 'react'
import './SplashScreen.css'

type SplashScreenProps = {
  onFinish: () => void
}

const SPLASH_DURATION_MS = 5000

function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <main className="splash">
      <div className="splash-glow" aria-hidden="true" />
      <p className="splash-wordmark">AI Diet Manager</p>
    </main>
  )
}

export default SplashScreen
