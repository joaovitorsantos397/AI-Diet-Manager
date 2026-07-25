import { Fragment, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './ChatScreen.css'
import type { Language } from '../types/language'
import type { CoachId } from '../types/coach'
import type { ChatMessage } from '../types/message'
import type { UserProfile } from '../types/userProfile'
import type { NutritionLogEntry } from '../types/nutritionLogEntry'
import { COACHES } from '../data/coaches'
import { sendChatMessage } from '../services/chatService'
import { buildSystemInstruction } from '../services/promptBuilder'
import { extractNutritionData } from '../services/nutritionExtractor'
import { extractFeedbackLevel } from '../services/feedbackExtractor'
import { extractCorrection } from '../services/correctionExtractor'
import { calculateDailyCalories } from '../services/calorieCalculator'
import { calculateMacros } from '../services/macroCalculator'
import { getTotalsForDay } from '../services/nutritionLog'
import { isSameDay } from '../utils/date'
import EvolutionScreen from './EvolutionScreen'

type ChatScreenProps = {
  language: Language
  coachId: CoachId
  profile: UserProfile
  initialMessages?: ChatMessage[]
  initialNutritionLog?: NutritionLogEntry[]
  onStateChange?: (
    messages: ChatMessage[],
    nutritionLog: NutritionLogEntry[],
  ) => void
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
  onStateChange,
}: ChatScreenProps) {
  const coach = COACHES.find((option) => option.value === coachId)!
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [],
  )
  const [draft, setDraft] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showEvolution, setShowEvolution] = useState(false)
  const [nutritionLog, setNutritionLog] = useState<NutritionLogEntry[]>(
    initialNutritionLog ?? [],
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const hasKickedOffRef = useRef((initialMessages?.length ?? 0) > 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastAttemptRef = useRef<ChatMessage[] | null>(null)

  const calories = calculateDailyCalories(profile)
  const macros = calculateMacros(profile, calories)
  const todayTotals = getTotalsForDay(nutritionLog)

  useEffect(() => {
    onStateChange?.(messages, nutritionLog)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, nutritionLog])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, isSending])

  async function sendToModel(fullMessages: ChatMessage[]) {
    lastAttemptRef.current = fullMessages
    setIsSending(true)

    try {
      const reply = await sendChatMessage({
        messages: fullMessages,
        systemInstruction: buildSystemInstruction({
          coachId,
          profile,
          language,
        }),
      })

      const { cleanedReply: replyAfterNutrition, entry } =
        extractNutritionData(reply)
      const { cleanedReply: replyAfterCorrection, shouldRemoveLast } =
        extractCorrection(replyAfterNutrition)
      const { cleanedReply, level } = extractFeedbackLevel(
        replyAfterCorrection,
      )

      if (shouldRemoveLast || entry) {
        setNutritionLog((current) => {
          const withoutLast = shouldRemoveLast ? current.slice(0, -1) : current
          return entry
            ? [
                ...withoutLast,
                { id: crypto.randomUUID(), timestamp: Date.now(), ...entry },
              ]
            : withoutLast
        })
      }

      const parts = cleanedReply
        .split(MESSAGE_SPLIT_MARKER)
        .map((part) => part.trim())
        .filter((part) => part !== '')

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
          },
        ])
        if (index < parts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 600))
        }
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
    sendToModel([kickoffMessage])
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

    const imageUrl = URL.createObjectURL(file)
    const base64Data = await blobToBase64(file)
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'image',
      imageUrl,
      base64Data,
      mimeType: file.type,
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

        setMessages(fullMessages)
        await sendToModel(fullMessages)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch (error) {
      console.error('Microphone access denied or unavailable', error)
    }
  }

  if (showEvolution) {
    return (
      <EvolutionScreen
        language={language}
        nutritionLog={nutritionLog}
        targetCalories={calories}
        targetProtein={macros.proteinGrams}
        onClose={() => setShowEvolution(false)}
      />
    )
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <span className="option-icon">{coach.icon}</span>

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

      <div className="chat-messages">
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
          <div className="chat-bubble chat-bubble-coach chat-bubble-typing">
            <span />
            <span />
            <span />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

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
          disabled={isSending}
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
          disabled={isSending}
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
          disabled={isSending}
        />

        <button type="submit" className="chat-send-button" disabled={isSending}>
          {language === 'pt' ? 'Enviar' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default ChatScreen
