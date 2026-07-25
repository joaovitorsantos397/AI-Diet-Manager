import type { CoachId } from '../types/coach'

export type CoachOption = {
  value: CoachId
  icon: string
  name: { pt: string; en: string }
  tagline: { pt: string; en: string }
}

export const COACHES: CoachOption[] = [
  {
    value: 'supportive',
    icon: '😊',
    name: { pt: 'Apoiador', en: 'Supportive' },
    tagline: { pt: 'Estou do seu lado.', en: "I'm on your side." },
  },
  {
    value: 'balanced',
    icon: '😐',
    name: { pt: 'Equilibrado', en: 'Balanced' },
    tagline: {
      pt: 'Vou orientar seu progresso.',
      en: "I'll guide your progress.",
    },
  },
  {
    value: 'direct',
    icon: '🔥',
    name: { pt: 'Direto', en: 'Direct' },
    tagline: {
      pt: 'Vou dizer exatamente o que aconteceu.',
      en: "I'll tell you exactly what happened.",
    },
  },
  {
    value: 'old_school',
    icon: '🏋️',
    name: { pt: 'Old School', en: 'Old School' },
    tagline: {
      pt: 'Você quer shape ou desculpa?',
      en: 'Do you want gains or excuses?',
    },
  },
  {
    value: 'mana',
    icon: '💅',
    name: { pt: 'Mana', en: 'Mana' },
    tagline: {
      pt: 'Meu amor, bora parar de inventar moda.',
      en: "My love, let's stop making excuses.",
    },
  },
]
