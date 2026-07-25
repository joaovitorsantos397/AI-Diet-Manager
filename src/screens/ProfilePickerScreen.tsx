import { useState } from 'react'
import ScreenCard from '../components/ScreenCard'
import type { Language } from '../types/language'
import type { SavedProfile } from '../types/savedProfile'
import { getSavedProfiles, deleteProfile } from '../services/profileStorage'

type ProfilePickerScreenProps = {
  language: Language
  onContinueProfile: (profile: SavedProfile) => void
  onCreateNew: () => void
}

function ProfilePickerScreen({
  language,
  onContinueProfile,
  onCreateNew,
}: ProfilePickerScreenProps) {
  const [profiles, setProfiles] = useState(getSavedProfiles())

  function handleDelete(id: string) {
    deleteProfile(id)
    setProfiles(getSavedProfiles())
  }

  return (
    <ScreenCard cardClassName="choice-card">
      <h1>{language === 'pt' ? 'Perfis de teste' : 'Test profiles'}</h1>

      <p className="subtitle">
        {language === 'pt'
          ? 'Ferramenta só para desenvolvimento — troque entre perfis sem refazer o onboarding. Não aparece em produção.'
          : "Development-only tool — switch between profiles without redoing onboarding. Doesn't appear in production."}
      </p>

      {profiles.length > 0 && (
        <div className="choice-list">
          {profiles.map((saved) => (
            <div key={saved.id} className="dev-profile-row">
              <button
                className="choice-button"
                onClick={() => onContinueProfile(saved)}
              >
                {language === 'pt'
                  ? `Continuar como ${saved.label}`
                  : `Continue as ${saved.label}`}
              </button>

              <button
                type="button"
                className="dev-profile-delete"
                onClick={() => handleDelete(saved.id)}
                aria-label={
                  language === 'pt' ? 'Excluir perfil' : 'Delete profile'
                }
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      <button className="primary-button" onClick={onCreateNew}>
        {language === 'pt' ? 'Criar novo perfil' : 'Create new profile'}
      </button>
    </ScreenCard>
  )
}

export default ProfilePickerScreen
