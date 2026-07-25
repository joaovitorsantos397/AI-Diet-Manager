import type { ReactNode } from 'react'

type ScreenCardProps = {
  cardClassName: string
  children: ReactNode
}

function ScreenCard({ cardClassName, children }: ScreenCardProps) {
  return (
    <main className="app">
      <section className={cardClassName}>
        <p className="eyebrow">AI Diet Manager</p>
        {children}
      </section>
    </main>
  )
}

export default ScreenCard
