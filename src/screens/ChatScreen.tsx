import { Fragment, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './ChatScreen.css'
import type { Language } from '../types/language'
import type { CoachId } from '../types/coach'
import type { ChatMessage } from '../types/message'
import type { UserProfile } from '../types/userProfile'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'
import type { WeightLogEntry } from '../types/weightLogEntry'
import type { Goal } from '../types/goal'
import type { Macros } from '../types/macros'
import { COACHES } from '../data/coaches'
import { sendChatMessage } from '../services/chatService'
import { transcribeAudio } from '../services/transcriptionService'
import { buildSystemInstruction } from '../services/promptBuilder'
import { fetchTodaysBandejaoMenu } from '../services/bandejaoService'
import type { BandejaoMenu } from '../types/bandejaoMenu'
import { extractFeedbackLevel } from '../services/feedbackExtractor'
import { calculateDailyCalories } from '../services/calorieCalculator'
import { calculateMacros } from '../services/macroCalculator'
import { getEffectiveProfile } from '../services/weightLog'
import { getTotalsForDay } from '../services/nutritionLog'
import { isSameDay, resolveLoggedTimestamp } from '../utils/date'
import { resizeImageForUpload } from '../utils/image'
import EvolutionScreen from './EvolutionScreen'

type ChatScreenProps = {
  language: Language
  coachId: CoachId
  profile: UserProfile
  initialMessages?: ChatMessage[]
  initialNutritionLog?: NutritionLogEntry[]
  initialWeightLog?: WeightLogEntry[]
  initialBandejaoUser?: boolean | null
  initialGoalOverride?: Goal | null
  onStateChange?: (
    messages: ChatMessage[],
    nutritionLog: NutritionLogEntry[],
    weightLog: WeightLogEntry[],
    bandejaoUser: boolean | null,
    goalOverride: Goal | null,
  ) => void
}

function formatTargetsSummary(
  calories: number,
  macros: Macros,
  language: Language,
): string {
  return language === 'pt'
    ? `Calorias: ${calories} kcal\nProteína: ${macros.proteinGrams}g · Carboidratos: ${macros.carbsGrams}g · Gordura: ${macros.fatGrams}g\nÁgua: ${(macros.waterMl / 1000).toFixed(1)}L`
    : `Calories: ${calories} kcal\nProtein: ${macros.proteinGrams}g · Carbs: ${macros.carbsGrams}g · Fat: ${macros.fatGrams}g\nWater: ${(macros.waterMl / 1000).toFixed(1)}L`
}

const GOAL_LABELS: Record<Goal, { pt: string; en: string }> = {
  lose: { pt: 'Emagrecimento', en: 'Weight loss' },
  maintain: { pt: 'Manutenção', en: 'Maintenance' },
  lean_gain: { pt: 'Ganho de massa magra', en: 'Lean muscle gain' },
  aggressive_gain: { pt: 'Bulking', en: 'Bulking' },
}

const MESSAGE_SPLIT_MARKER = '|||'

function buildKickoffPrompt(language: Language, name: string): string {
  return language === 'pt'
    ? `Comece a conversa agora. Responda em exatamente 4 partes, cada uma separada pelo marcador ${MESSAGE_SPLIT_MARKER} sozinho numa linha (sem numerar, sem título):
1. Uma saudação bem curta cumprimentando ${name} pelo nome (ex: "Fala, ${name}!"), nada mais.
2. Explicação breve de que refeições podem ser registradas por texto, foto ou áudio, um pedido de sinceridade nos registros, uma nota de que pesar a comida numa balança é o ideal quando possível (senão dá pra usar medidas visuais, tipo uma concha cheia ou colheres), e pergunte se a pessoa tem balança de cozinha disponível — o dia todo, ou só em casa/à noite, por exemplo. Mencione também que se possível ela pode mandar foto da tabela nutricional da embalagem, foto do prato, uma descrição, ou o que for mais prático — e que quanto mais informação ela mandar, melhor fica a estimativa.
3. A proposta de plano de refeições para hoje, organizada em tópicos/lista por refeição (café da manhã, almoço, lanche, jantar) — não em texto corrido. Deixe claro logo no início dessa parte que é um primeiro rascunho, flexível, e que pode mudar.
4. Diga que se a pessoa for treinar hoje, dá pra adaptar o plano pra maximizar o desempenho no treino. Dê a orientação de espaçar a ingestão de água ao longo do dia em vez de tomar tudo de uma vez, seguindo suas instruções sobre isso. Termine perguntando os horários aproximados de cada refeição de hoje.`
    : `Start the conversation now. Reply in exactly 4 parts, each separated by the marker ${MESSAGE_SPLIT_MARKER} alone on its own line (no numbering, no titles):
1. A very short greeting addressing ${name} by name (e.g. "Hey, ${name}!"), nothing else.
2. A brief explanation that meals can be logged via text, photo or audio, an honesty ask, a note that weighing food is ideal when possible (otherwise visual measures like a full ladle or spoons work too), and ask whether they have a kitchen scale available — all day, or only at home/at night, for example. Also mention they can send a photo of a nutrition label, a photo of the plate, a description, or whatever's most practical — and that more information always makes the estimate better.
3. The meal plan proposal for today, organized as a list by meal (breakfast, lunch, snack, dinner) — not flowing prose. Make clear early in this part that it's a flexible first draft that can change.
4. Mention that if they're training today, the plan can be adapted to maximize training performance. Give guidance on spacing water intake across the day instead of drinking it all at once, per your instructions on that. End by asking for approximate times for today's meals.`
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

type PendingAudio = {
  audioUrl: string
  base64Data: string
  mimeType: string
  transcript: string | null
  isTranscribing: boolean
  transcriptFailed: boolean
}

function getDateDividerLabel(timestamp: number, language: Language): string {
  const date = new Date(timestamp)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (isSameDay(date, now)) {
    return language === 'pt' ? 'Hoje' : 'Today'
  }
  if (isSameDay(date, yesterday)) {
    return language === 'pt' ? 'Ontem' : 'Yesterday'
  }
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatMessageTime(timestamp: number, language: Language): string {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function ChatScreen({
  language,
  coachId,
  profile,
  initialMessages,
  initialNutritionLog,
  initialWeightLog,
  initialBandejaoUser,
  initialGoalOverride,
  onStateChange,
}: ChatScreenProps) {
  const coach = COACHES.find((option) => option.value === coachId)!
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [],
  )
  const [draft, setDraft] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [pendingAudio, setPendingAudio] = useState<PendingAudio | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showEvolution, setShowEvolution] = useState(false)
  const [nutritionLog, setNutritionLog] = useState<NutritionLogEntry[]>(
    initialNutritionLog ?? [],
  )
  const [weightLog, setWeightLog] = useState<WeightLogEntry[]>(
    initialWeightLog ?? [],
  )
  const [bandejaoUser, setBandejaoUser] = useState<boolean | null>(
    initialBandejaoUser ?? null,
  )
  const [goalOverride, setGoalOverride] = useState<Goal | null>(
    initialGoalOverride ?? null,
  )
  const [bandejaoMenu, setBandejaoMenu] = useState<BandejaoMenu | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const hasKickedOffRef = useRef((initialMessages?.length ?? 0) > 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastAttemptRef = useRef<ChatMessage[] | null>(null)
  // Anchor for the weigh-in reminder when no weigh-in has ever been logged:
  // the first message's timestamp approximates when this profile started,
  // without needing a dedicated onboarding-completion field.
  const conversationStartedAtRef = useRef(
    initialMessages?.[0]?.timestamp ?? Date.now(),
  )

  const effectiveProfile = getEffectiveProfile(profile, weightLog, goalOverride)
  const calories = calculateDailyCalories(effectiveProfile)
  const macros = calculateMacros(effectiveProfile, calories)
  const todayTotals = getTotalsForDay(nutritionLog)

  useEffect(() => {
    onStateChange?.(messages, nutritionLog, weightLog, bandejaoUser, goalOverride)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, nutritionLog, weightLog, bandejaoUser, goalOverride])

  useEffect(() => {
    if (bandejaoUser === true) {
      fetchTodaysBandejaoMenu().then(setBandejaoMenu)
    }
  }, [bandejaoUser])

  useEffect(() => {
    // showEvolution is in the deps too: returning from the Evolution screen
    // remounts this chat view fresh (it's an early-return replacement, not
    // an overlay), so without it the container silently stays scrolled to
    // its default top instead of jumping back to the latest message.
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, isSending, showEvolution])

  async function sendToModel(
    fullMessages: ChatMessage[],
    useTypingDelay = false,
  ) {
    lastAttemptRef.current = fullMessages
    setIsSending(true)

    try {
      const { text, functionCalls } = await sendChatMessage({
        messages: fullMessages,
        systemInstruction: buildSystemInstruction({
          coachId,
          profile,
          language,
          nutritionLog,
          weightLog,
          bandejaoUser,
          bandejaoMenu,
          goalOverride,
          conversationStartedAt: conversationStartedAtRef.current,
        }),
      })

      console.debug('Model reply:', { text, functionCalls })

      let newBandejaoUser: boolean | null = null
      let shouldRemoveLast = false
      let shouldClearToday = false
      const removeMealNumbers: number[] = []
      const newMealEntries: NutritionLogEntry[] = []
      let newWeightEntry: WeightLogEntry | null = null
      let newGoal: Goal | null = null

      for (const call of functionCalls) {
        const args = call.args ?? {}
        switch (call.name) {
          case 'clear_today_log':
            shouldClearToday = true
            break
          case 'log_meal': {
            const mealTime =
              typeof args.mealTime === 'string' ? args.mealTime : ''
            const loggedDate =
              typeof args.date === 'string' &&
              /^\d{4}-\d{2}-\d{2}$/.test(args.date)
                ? args.date
                : null
            newMealEntries.push({
              id: crypto.randomUUID(),
              timestamp: resolveLoggedTimestamp(loggedDate, mealTime),
              calories: Number(args.calories) || 0,
              proteinGrams: Number(args.proteinGrams) || 0,
              carbsGrams: Number(args.carbsGrams) || 0,
              fatGrams: Number(args.fatGrams) || 0,
              description:
                typeof args.description === 'string' ? args.description : '',
              mealTime,
            })
            break
          }
          case 'remove_last_meal':
            shouldRemoveLast = true
            break
          case 'remove_meal_by_number': {
            const entryNumber = Number(args.entryNumber)
            if (Number.isInteger(entryNumber) && entryNumber > 0) {
              removeMealNumbers.push(entryNumber)
            }
            break
          }
          case 'log_weight': {
            const weightKg = Number(args.weightKg) || 0
            if (weightKg > 0) {
              newWeightEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                weightKg,
                bodyFatPercentage:
                  args.bodyFatPercentage === null ||
                  args.bodyFatPercentage === undefined
                    ? null
                    : Number(args.bodyFatPercentage),
                basalMetabolicRate:
                  args.basalMetabolicRate === null ||
                  args.basalMetabolicRate === undefined
                    ? null
                    : Number(args.basalMetabolicRate),
              }
            }
            break
          }
          case 'change_goal': {
            const goal = args.goal
            if (
              goal === 'lose' ||
              goal === 'maintain' ||
              goal === 'lean_gain' ||
              goal === 'aggressive_gain'
            ) {
              newGoal = goal
            }
            break
          }
          case 'set_bandejao_user':
            newBandejaoUser = Boolean(args.isBandejaoUser)
            break
          default:
            break
        }
      }

      // Deterministic safety net: the model is instructed to call log_meal
      // once per distinct item, but a single response calling it more than
      // once for the exact same item (identical values) is never
      // intentional — collapse those down to one entry instead of trusting
      // prompt compliance alone for something this consequential.
      const seenMealSignatures = new Set<string>()
      const dedupedMealEntries = newMealEntries.filter((entry) => {
        const signature = [
          entry.calories,
          entry.proteinGrams,
          entry.carbsGrams,
          entry.fatGrams,
          entry.description,
          entry.mealTime,
        ].join('|')
        if (seenMealSignatures.has(signature)) {
          console.warn('Dropped duplicate log_meal call in the same reply:', entry)
          return false
        }
        seenMealSignatures.add(signature)
        return true
      })

      if (newBandejaoUser !== null) {
        setBandejaoUser(newBandejaoUser)
      }

      if (
        shouldClearToday ||
        shouldRemoveLast ||
        removeMealNumbers.length > 0 ||
        dedupedMealEntries.length > 0
      ) {
        setNutritionLog((current) => {
          // #N refers to the entry's position in "Today's logged meals" as
          // the model actually read it (promptBuilder.ts sorts today's
          // entries by timestamp ascending) — resolved against the
          // pre-turn state, before any other change from this same turn.
          const todaysEntryIds = current
            .filter((entry) => isSameDay(new Date(entry.timestamp), new Date()))
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((entry) => entry.id)
          const idsToRemoveByNumber = new Set(
            removeMealNumbers
              .map((n) => todaysEntryIds[n - 1])
              .filter((id): id is string => id !== undefined),
          )

          let updated = shouldClearToday
            ? current.filter(
                (logEntry) => !isSameDay(new Date(logEntry.timestamp), new Date()),
              )
            : current
          updated = shouldRemoveLast ? updated.slice(0, -1) : updated
          if (idsToRemoveByNumber.size > 0) {
            updated = updated.filter(
              (logEntry) => !idsToRemoveByNumber.has(logEntry.id),
            )
          }
          return [...updated, ...dedupedMealEntries]
        })
      }

      if (newWeightEntry) {
        setWeightLog((current) => [...current, newWeightEntry!])
      }

      const goalChanged = newGoal !== null && newGoal !== effectiveProfile.goal
      if (goalChanged) {
        setGoalOverride(newGoal)
      }

      const { cleanedReply, level } = extractFeedbackLevel(text)
      const parts = cleanedReply
        .split(MESSAGE_SPLIT_MARKER)
        .map((part) => part.trim())
        .filter((part) => part !== '')

      // The model is instructed to always include text alongside any
      // function calls, but that's still a prompt instruction, not a
      // guarantee — a turn that's all function calls and no text would
      // otherwise leave the user staring at silence with no sign their
      // message was even received.
      const isFallbackReply = parts.length === 0 && functionCalls.length > 0
      if (isFallbackReply) {
        console.warn(
          'Reply had no text; falling back to a generic confirmation. Function calls received:',
          functionCalls,
        )
        parts.push(
          language === 'pt' ? 'Feito.' : 'Done.',
        )
      }

      for (const [index, part] of parts.entries()) {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'coach',
            type: 'text',
            content: part,
            timestamp: Date.now(),
            ...(level ? { feedbackLevel: level } : {}),
            // Never fed back to the model as history — it didn't actually
            // write this, and seeing it in its own past turns would teach
            // it (in-context) to keep replying this tersely.
            ...(isFallbackReply ? { isSynthetic: true } : {}),
          },
        ])
        if (useTypingDelay && index < parts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 600))
        }
      }

      // Never let a target change happen silently in the background — tell
      // the user with the app's own computed numbers (ground truth), not
      // the model's prose, the same principle used everywhere else in this
      // file (NUTRITION_DATA, corrections, etc.).
      if (newWeightEntry) {
        const updatedProfile = getEffectiveProfile(
          profile,
          [...weightLog, newWeightEntry],
          goalOverride,
        )
        const updatedCalories = calculateDailyCalories(updatedProfile)
        const updatedMacros = calculateMacros(updatedProfile, updatedCalories)

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'coach',
            type: 'text',
            content:
              (language === 'pt'
                ? 'Novo peso registrado — recalculando suas metas com base nele:\n\n'
                : 'New weight logged — recalculating your targets from it:\n\n') +
              formatTargetsSummary(updatedCalories, updatedMacros, language),
            timestamp: Date.now(),
            isSynthetic: true,
          },
        ])
      }

      if (goalChanged) {
        const updatedProfile = getEffectiveProfile(profile, weightLog, newGoal)
        const updatedCalories = calculateDailyCalories(updatedProfile)
        const updatedMacros = calculateMacros(updatedProfile, updatedCalories)
        const goalLabel = GOAL_LABELS[newGoal!][language]

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'coach',
            type: 'text',
            content:
              (language === 'pt'
                ? `Objetivo atualizado para "${goalLabel}" — recalculando suas metas com base nele:\n\n`
                : `Goal updated to "${goalLabel}" — recalculating your targets from it:\n\n`) +
              formatTargetsSummary(updatedCalories, updatedMacros, language),
            timestamp: Date.now(),
            isSynthetic: true,
          },
        ])
      }
    } catch (error) {
      console.error('Chat request failed', error)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'coach',
          type: 'text',
          content:
            language === 'pt'
              ? 'Não consegui responder agora. Tenta de novo em instantes.'
              : "Couldn't reply right now. Try again in a moment.",
          timestamp: Date.now(),
          isError: true,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleRetry() {
    if (isSending || !lastAttemptRef.current) {
      return
    }
    const attempt = lastAttemptRef.current
    setMessages((current) =>
      current.filter((message) => !(message.type === 'text' && message.isError)),
    )
    sendToModel(attempt)
  }

  useEffect(() => {
    if (hasKickedOffRef.current) {
      return
    }
    hasKickedOffRef.current = true
    const kickoffMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content: buildKickoffPrompt(language, profile.name),
      timestamp: Date.now(),
    }
    sendToModel([kickoffMessage], true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const content = draft.trim()
    if (content === '' || isSending) {
      return
    }

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content,
      timestamp: Date.now(),
    }
    const fullMessages = [...messages, newMessage]

    setMessages(fullMessages)
    setDraft('')

    await sendToModel(fullMessages)
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || isSending) {
      return
    }

    const uploadBlob = await resizeImageForUpload(file)
    const imageUrl = URL.createObjectURL(uploadBlob)
    const base64Data = await blobToBase64(uploadBlob)
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'image',
      imageUrl,
      base64Data,
      mimeType: uploadBlob.type || file.type,
      timestamp: Date.now(),
    }
    const fullMessages = [...messages, newMessage]

    setMessages(fullMessages)
    await sendToModel(fullMessages)
  }

  async function handleToggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const audioUrl = URL.createObjectURL(audioBlob)
        const base64Data = await blobToBase64(audioBlob)
        stream.getTracks().forEach((track) => track.stop())

        setPendingAudio({
          audioUrl,
          base64Data,
          mimeType,
          transcript: null,
          isTranscribing: true,
          transcriptFailed: false,
        })

        try {
          const transcript = await transcribeAudio({
            base64Data,
            mimeType,
            language,
          })
          setPendingAudio((current) =>
            current && current.audioUrl === audioUrl
              ? { ...current, transcript, isTranscribing: false }
              : current,
          )
        } catch (error) {
          console.error('Audio transcription failed', error)
          setPendingAudio((current) =>
            current && current.audioUrl === audioUrl
              ? { ...current, isTranscribing: false, transcriptFailed: true }
              : current,
          )
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch (error) {
      console.error('Microphone access denied or unavailable', error)
    }
  }

  function handleDiscardPendingAudio() {
    if (!pendingAudio) {
      return
    }
    URL.revokeObjectURL(pendingAudio.audioUrl)
    setPendingAudio(null)
  }

  async function handleRerecordAudio() {
    handleDiscardPendingAudio()
    await handleToggleRecording()
  }

  async function handleConfirmPendingAudio() {
    if (!pendingAudio || isSending) {
      return
    }

    const { audioUrl, base64Data, mimeType } = pendingAudio
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'audio',
      audioUrl,
      base64Data,
      mimeType,
      timestamp: Date.now(),
    }
    const fullMessages = [...messages, newMessage]

    setPendingAudio(null)
    setMessages(fullMessages)
    await sendToModel(fullMessages)
  }

  if (showEvolution) {
    return (
      <EvolutionScreen
        language={language}
        nutritionLog={nutritionLog}
        weightLog={weightLog}
        targetCalories={calories}
        targetProtein={macros.proteinGrams}
        onClose={() => setShowEvolution(false)}
      />
    )
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <span className="option-icon" aria-hidden="true">
          {coach.icon}
        </span>

        <div className="chat-header-info">
          <strong>{coach.name[language]}</strong>
          <small className="chat-progress">
            {todayTotals.calories} / {calories} kcal ·{' '}
            {todayTotals.proteinGrams} / {macros.proteinGrams}g{' '}
            {language === 'pt' ? 'proteína' : 'protein'}
          </small>
        </div>

        <button
          type="button"
          className="chat-icon-button chat-evolution-button"
          onClick={() => setShowEvolution(true)}
          aria-label={language === 'pt' ? 'Ver evolução' : 'View evolution'}
        >
          📈
        </button>
      </header>

      <div className="chat-messages" role="log" aria-live="polite">
        {messages.length === 0 && !isSending ? (
          <p className="chat-empty">
            {language === 'pt'
              ? 'Conte pro seu coach o que você comeu — em texto, foto ou áudio.'
              : 'Tell your coach what you ate — text, photo or audio.'}
          </p>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1]
            const showDivider =
              !previous ||
              !isSameDay(
                new Date(previous.timestamp),
                new Date(message.timestamp),
              )

            return (
              <Fragment key={message.id}>
                {showDivider && (
                  <div className="chat-date-divider">
                    <span>
                      {getDateDividerLabel(message.timestamp, language)}
                    </span>
                  </div>
                )}

                <div
                  className={
                    message.type !== 'text'
                      ? `chat-bubble chat-bubble-${message.role} chat-bubble-media`
                      : `chat-bubble chat-bubble-${message.role}`
                  }
                >
                  {message.type === 'text' && message.feedbackLevel && (
                    <span
                      className={`chat-feedback-dot chat-feedback-dot-${message.feedbackLevel}`}
                      aria-hidden="true"
                    />
                  )}

                  {message.type === 'text' && message.content}

                  {message.type === 'image' && (
                    <img
                      className="chat-bubble-image"
                      src={message.imageUrl}
                      alt={
                        language === 'pt'
                          ? 'Foto da refeição enviada'
                          : 'Submitted meal photo'
                      }
                    />
                  )}

                  {message.type === 'audio' && (
                    <audio
                      className="chat-bubble-audio"
                      src={message.audioUrl}
                      controls
                    />
                  )}

                  <span className="chat-bubble-time">
                    {formatMessageTime(message.timestamp, language)}
                  </span>
                </div>

                {message.type === 'text' &&
                  message.isError &&
                  index === messages.length - 1 && (
                    <button
                      type="button"
                      className="chat-retry-button"
                      onClick={handleRetry}
                      disabled={isSending}
                    >
                      🔄 {language === 'pt' ? 'Tentar de novo' : 'Retry'}
                    </button>
                  )}
              </Fragment>
            )
          })
        )}

        {isSending && (
          <div
            className="chat-bubble chat-bubble-coach chat-bubble-typing"
            aria-label={language === 'pt' ? 'Digitando…' : 'Typing…'}
          >
            <span />
            <span />
            <span />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {pendingAudio && (
        <div className="chat-audio-preview">
          <audio
            className="chat-audio-preview-player"
            src={pendingAudio.audioUrl}
            controls
          />

          <p className="chat-audio-preview-transcript">
            {pendingAudio.isTranscribing
              ? language === 'pt'
                ? 'Transcrevendo…'
                : 'Transcribing…'
              : pendingAudio.transcriptFailed
                ? language === 'pt'
                  ? 'Não consegui transcrever — confira o áudio antes de enviar.'
                  : "Couldn't transcribe — check the audio before sending."
                : `“${pendingAudio.transcript}”`}
          </p>

          <div className="chat-audio-preview-actions">
            <button
              type="button"
              className="chat-audio-preview-rerecord"
              onClick={handleRerecordAudio}
              disabled={isSending}
            >
              🔄 {language === 'pt' ? 'Regravar' : 'Re-record'}
            </button>

            <button
              type="button"
              className="chat-audio-preview-confirm"
              onClick={handleConfirmPendingAudio}
              disabled={isSending || pendingAudio.isTranscribing}
            >
              ✔️ {language === 'pt' ? 'Confirmar e enviar' : 'Confirm and send'}
            </button>
          </div>
        </div>
      )}

      <form className="chat-composer" onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="chat-file-input"
          onChange={handlePhotoSelected}
        />

        <button
          type="button"
          className="chat-icon-button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={language === 'pt' ? 'Anexar foto' : 'Attach photo'}
          disabled={isSending || !!pendingAudio}
        >
          📷
        </button>

        <button
          type="button"
          className={
            isRecording
              ? 'chat-icon-button chat-icon-button-active'
              : 'chat-icon-button'
          }
          onClick={handleToggleRecording}
          aria-label={
            isRecording
              ? language === 'pt'
                ? 'Parar gravação'
                : 'Stop recording'
              : language === 'pt'
                ? 'Gravar áudio'
                : 'Record audio'
          }
          disabled={isSending || !!pendingAudio}
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>

        <input
          type="text"
          className="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            language === 'pt' ? 'Digite sua refeição...' : 'Type your meal...'
          }
          aria-label={
            language === 'pt' ? 'Digite sua refeição' : 'Type your meal'
          }
          disabled={isSending || !!pendingAudio}
        />

        <button
          type="submit"
          className="chat-send-button"
          disabled={isSending || !!pendingAudio}
        >
          {language === 'pt' ? 'Enviar' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default ChatScreen
