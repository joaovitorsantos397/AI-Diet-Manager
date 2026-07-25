import { useState } from 'react'
import './App.css'
import ScreenCard from './components/ScreenCard'
import SplashScreen from './screens/SplashScreen'
import WelcomeScreen from './screens/WelcomeScreen'
import NameScreen from './screens/onboarding/NameScreen'
import GoalScreen from './screens/onboarding/GoalScreen'
import SexScreen from './screens/onboarding/SexScreen'
import AgeScreen from './screens/onboarding/AgeScreen'
import HeightScreen from './screens/onboarding/HeightScreen'
import WeightScreen from './screens/onboarding/WeightScreen'
import BodyFatScreen from './screens/onboarding/BodyFatScreen'
import BasalMetabolicRateScreen from './screens/onboarding/BasalMetabolicRateScreen'
import ActivityLevelScreen from './screens/onboarding/ActivityLevelScreen'
import TrainingRoutineScreen from './screens/onboarding/TrainingRoutineScreen'
import TrainingScheduleScreen from './screens/onboarding/TrainingScheduleScreen'
import HormoneUseScreen from './screens/onboarding/HormoneUseScreen'
import CoachScreen from './screens/onboarding/CoachScreen'
import NutritionResultScreen from './screens/onboarding/NutritionResultScreen'
import ChatScreen from './screens/ChatScreen'
import ProfilePickerScreen from './screens/ProfilePickerScreen'
import { saveProfile } from './services/profileStorage'
import { getSession, saveSession } from './services/sessionStorage'
import type { Language } from './types/language'
import type { Goal } from './types/goal'
import type { Sex } from './types/sex'
import type { ActivityLevel } from './types/activityLevel'
import type { HormoneUse } from './types/hormoneUse'
import type { TrainingRoutine } from './types/trainingRoutine'
import type { CoachId } from './types/coach'
import type { SavedProfile } from './types/savedProfile'

function App() {
  // In production (no dev picker), silently resume the last session
  // saved in this browser, if any.
  const initialSession = !import.meta.env.DEV ? getSession() : null

  const [showSplash, setShowSplash] = useState(true)
  const [language, setLanguage] = useState<Language | null>(
    initialSession?.language ?? null,
  )
  const [devPickerResolved, setDevPickerResolved] = useState(
    !import.meta.env.DEV,
  )
  const [loadedProfile, setLoadedProfile] = useState<SavedProfile | null>(
    initialSession
      ? {
          id: 'session',
          label: initialSession.profile.name,
          language: initialSession.language,
          coachId: initialSession.coachId,
          profile: initialSession.profile,
          messages: initialSession.messages,
          nutritionLog: initialSession.nutritionLog,
        }
      : null,
  )
  const [activeProfileId] = useState(() => crypto.randomUUID())
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [started, setStarted] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [sex, setSex] = useState<Sex | null>(null)
  const [age, setAge] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [weight, setWeight] = useState<number | null>(null)
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number | null>(
    null,
  )
  const [bodyFatSkipped, setBodyFatSkipped] = useState(false)
  const [basalMetabolicRate, setBasalMetabolicRate] = useState<number | null>(
    null,
  )
  const [bmrSkipped, setBmrSkipped] = useState(false)
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    null,
  )
  const [trainingRoutine, setTrainingRoutine] =
    useState<TrainingRoutine | null>(null)
  const [trainingSchedule, setTrainingSchedule] = useState<string | null>(
    null,
  )
  const [hormoneUse, setHormoneUse] = useState<HormoneUse | null>(null)
  const [coach, setCoach] = useState<CoachId | null>(null)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (language === null) {
    return (
      <ScreenCard cardClassName="language-card">
        <h1>Escolha seu idioma</h1>

        <p className="subtitle">
          Choose your preferred language to continue.
        </p>

        <div className="language-options">
          <button
            className="language-button"
            onClick={() => setLanguage('pt')}
          >
            <span className="option-icon" aria-hidden="true">
              🇧🇷
            </span>

            <span>
              <strong>Português</strong>
              <small>Continuar em português</small>
            </span>
          </button>

          <button
            className="language-button"
            onClick={() => setLanguage('en')}
          >
            <span className="option-icon" aria-hidden="true">
              🇺🇸
            </span>

            <span>
              <strong>English</strong>
              <small>Continue in English</small>
            </span>
          </button>
        </div>
      </ScreenCard>
    )
  }

  if (!devPickerResolved) {
    return (
      <ProfilePickerScreen
        language={language}
        onContinueProfile={(saved) => {
          setLoadedProfile(saved)
          setDevPickerResolved(true)
        }}
        onCreateNew={() => {
          setIsCreatingProfile(true)
          setDevPickerResolved(true)
        }}
      />
    )
  }

  if (loadedProfile) {
    return (
      <ChatScreen
        language={loadedProfile.language}
        coachId={loadedProfile.coachId}
        profile={loadedProfile.profile}
        initialMessages={loadedProfile.messages}
        initialNutritionLog={loadedProfile.nutritionLog}
        onStateChange={(messages, nutritionLog) => {
          if (import.meta.env.DEV) {
            saveProfile({ ...loadedProfile, messages, nutritionLog })
          } else {
            saveSession({
              language: loadedProfile.language,
              coachId: loadedProfile.coachId,
              profile: loadedProfile.profile,
              messages,
              nutritionLog,
            })
          }
        }}
      />
    )
  }

  if (!started) {
    return (
      <WelcomeScreen
        language={language}
        onChangeLanguage={() => setLanguage(null)}
        onStart={() => setStarted(true)}
      />
    )
  }

  if (name === null) {
    return <NameScreen language={language} value={name} onSubmit={setName} />
  }

  if (goal === null) {
    return (
      <GoalScreen language={language} selectedGoal={goal} onSelect={setGoal} />
    )
  }

  if (sex === null) {
    return (
      <SexScreen language={language} selectedSex={sex} onSelect={setSex} />
    )
  }

  if (age === null) {
    return <AgeScreen language={language} value={age} onSubmit={setAge} />
  }

  if (height === null) {
    return (
      <HeightScreen language={language} value={height} onSubmit={setHeight} />
    )
  }

  if (weight === null) {
    return (
      <WeightScreen language={language} value={weight} onSubmit={setWeight} />
    )
  }

  if (bodyFatPercentage === null && !bodyFatSkipped) {
    return (
      <BodyFatScreen
        language={language}
        value={bodyFatPercentage}
        onSubmit={setBodyFatPercentage}
        onSkip={() => setBodyFatSkipped(true)}
      />
    )
  }

  if (basalMetabolicRate === null && !bmrSkipped) {
    return (
      <BasalMetabolicRateScreen
        language={language}
        value={basalMetabolicRate}
        onSubmit={setBasalMetabolicRate}
        onSkip={() => setBmrSkipped(true)}
      />
    )
  }

  if (activityLevel === null) {
    return (
      <ActivityLevelScreen
        language={language}
        selectedLevel={activityLevel}
        onSelect={setActivityLevel}
      />
    )
  }

  if (trainingRoutine === null) {
    return (
      <TrainingRoutineScreen
        language={language}
        selectedRoutine={trainingRoutine}
        onSelect={setTrainingRoutine}
      />
    )
  }

  if (trainingRoutine === 'fixed' && trainingSchedule === null) {
    return (
      <TrainingScheduleScreen
        language={language}
        value={trainingSchedule}
        onSubmit={setTrainingSchedule}
      />
    )
  }

  if (hormoneUse === null) {
    return (
      <HormoneUseScreen
        language={language}
        selectedValue={hormoneUse}
        onSelect={setHormoneUse}
      />
    )
  }

  if (coach === null) {
    return (
      <CoachScreen
        language={language}
        selectedCoach={coach}
        onSelect={setCoach}
      />
    )
  }

  const profile = {
    name,
    goal,
    sex,
    age,
    height,
    weight,
    bodyFatPercentage,
    basalMetabolicRate,
    activityLevel,
    trainingRoutine,
    trainingSchedule,
    hormoneUse,
  }

  if (!onboardingComplete) {
    return (
      <NutritionResultScreen
        language={language}
        profile={profile}
        onContinue={() => setOnboardingComplete(true)}
      />
    )
  }

  return (
    <ChatScreen
      language={language}
      coachId={coach}
      profile={profile}
      onStateChange={(messages, nutritionLog) => {
        if (import.meta.env.DEV) {
          if (isCreatingProfile) {
            saveProfile({
              id: activeProfileId,
              label: name,
              language,
              coachId: coach,
              profile,
              messages,
              nutritionLog,
            })
          }
        } else {
          saveSession({
            language,
            coachId: coach,
            profile,
            messages,
            nutritionLog,
          })
        }
      }}
    />
  )
}

export default App
