import { useEffect, useState } from 'react'

import Button from '../components/Button'
import PageCard from '../components/PageCard'
import {
  clearProfile,
  getProfile,
  saveProfile,
} from '../services/profileApi'
import './MvpPages.css'

const PROFILE_STORAGE_KEY =
  'career-companion-profile'

const emptyProfile = {
  id: null,
  name: '',
  targetRole: '',
  location: '',
  weeklyApplicationGoal: '5',
  careerFocus: '',
}

function ProfilePage() {
  const [profile, setProfile] =
    useState(emptyProfile)
  const [isLoading, setIsLoading] =
    useState(true)
  const [isSaving, setIsSaving] =
    useState(false)
  const [isClearing, setIsClearing] =
    useState(false)
  const [saveMessage, setSaveMessage] =
    useState('')
  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        let storedProfile =
          await getProfile()

        const localProfile =
          loadLocalProfile()

        if (
          !storedProfile.id &&
          hasMeaningfulProfileData(localProfile)
        ) {
          storedProfile =
            await saveProfile(localProfile)

          localStorage.removeItem(
            PROFILE_STORAGE_KEY
          )
        }

        if (isMounted) {
          setProfile(storedProfile)
        }
      } catch (error) {
        console.error(
          'Unable to load career profile:',
          error
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'Unable to load your career profile.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))

    setSaveMessage('')
    setErrorMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSaving(true)
      setSaveMessage('')
      setErrorMessage('')

      const savedProfile =
        await saveProfile(profile)

      setProfile(savedProfile)
      localStorage.removeItem(
        PROFILE_STORAGE_KEY
      )
      setSaveMessage(
        'Career profile saved to your account.'
      )
    } catch (error) {
      console.error(
        'Unable to save career profile:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to save your career profile.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleClear() {
    try {
      setIsClearing(true)
      setSaveMessage('')
      setErrorMessage('')

      const clearedProfile =
        await clearProfile()

      setProfile(clearedProfile)
      localStorage.removeItem(
        PROFILE_STORAGE_KEY
      )
      setSaveMessage(
        'Career profile cleared.'
      )
    } catch (error) {
      console.error(
        'Unable to clear career profile:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to clear your career profile.'
      )
    } finally {
      setIsClearing(false)
    }
  }

  const isBusy =
    isLoading ||
    isSaving ||
    isClearing

  return (
    <div className="mvp-page profile-page">
      <header className="mvp-page__header">
        <p className="mvp-page__eyebrow">
          Career direction
        </p>

        <h1>Your career profile</h1>

        <p className="mvp-page__intro">
          Keep your current goals visible so the rest of
          your job search remains focused and
          intentional. Your profile is securely saved
          to your Career Companion account.
        </p>
      </header>

      {errorMessage && (
        <div
          className="mvp-callout"
          role="alert"
        >
          <h3>Something needs your attention</h3>
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mvp-page__grid mvp-page__grid--two-column">
        <PageCard
          title="Profile details"
          description="Update the information guiding your search."
        >
          {isLoading ? (
            <div className="mvp-callout">
              <h3>Loading your career profile</h3>

              <p>
                We’re retrieving your saved career
                direction from your account.
              </p>
            </div>
          ) : (
            <form
              className="form-grid"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="profile-name">
                  Name
                </label>

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={profile.name}
                  placeholder="Your name"
                  onChange={handleChange}
                  disabled={isBusy}
                  maxLength={200}
                />
              </div>

              <div className="form-field">
                <label htmlFor="profile-target-role">
                  Target role
                </label>

                <input
                  id="profile-target-role"
                  name="targetRole"
                  type="text"
                  value={profile.targetRole}
                  placeholder="Example: AI Product Engineer"
                  onChange={handleChange}
                  disabled={isBusy}
                  maxLength={200}
                />
              </div>

              <div className="form-field">
                <label htmlFor="profile-location">
                  Preferred location
                </label>

                <input
                  id="profile-location"
                  name="location"
                  type="text"
                  value={profile.location}
                  placeholder="Example: Remote or Dallas Fort Worth"
                  onChange={handleChange}
                  disabled={isBusy}
                  maxLength={200}
                />
              </div>

              <div className="form-field">
                <label htmlFor="profile-weekly-goal">
                  Weekly application goal
                </label>

                <select
                  id="profile-weekly-goal"
                  name="weeklyApplicationGoal"
                  value={
                    profile.weeklyApplicationGoal
                  }
                  onChange={handleChange}
                  disabled={isBusy}
                >
                  <option value="3">
                    3 focused applications
                  </option>

                  <option value="5">
                    5 focused applications
                  </option>

                  <option value="7">
                    7 focused applications
                  </option>

                  <option value="10">
                    10 focused applications
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="profile-career-focus">
                  Career focus
                </label>

                <textarea
                  id="profile-career-focus"
                  name="careerFocus"
                  value={profile.careerFocus}
                  placeholder="Describe the type of work, products, or impact you want to pursue."
                  onChange={handleChange}
                  disabled={isBusy}
                />
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  disabled={isBusy}
                >
                  {isSaving
                    ? 'Saving profile...'
                    : 'Save profile'}
                </Button>

                <button
                  className="text-button"
                  type="button"
                  onClick={handleClear}
                  disabled={isBusy}
                >
                  {isClearing
                    ? 'Clearing profile...'
                    : 'Clear profile'}
                </button>

                {saveMessage && (
                  <p
                    className="save-message"
                    role="status"
                  >
                    {saveMessage}
                  </p>
                )}
              </div>
            </form>
          )}
        </PageCard>

        <PageCard
          title="Career direction"
          description="Your current job search focus at a glance."
        >
          <dl className="summary-list">
            <div>
              <dt>Name</dt>
              <dd>
                {profile.name ||
                  'Add your name to personalize your profile.'}
              </dd>
            </div>

            <div>
              <dt>Target role</dt>
              <dd>
                {profile.targetRole ||
                  'Add the role you want to pursue.'}
              </dd>
            </div>

            <div>
              <dt>Location</dt>
              <dd>
                {profile.location ||
                  'Add your preferred work location.'}
              </dd>
            </div>

            <div>
              <dt>Weekly goal</dt>
              <dd>
                {profile.weeklyApplicationGoal}{' '}
                focused applications
              </dd>
            </div>

            <div>
              <dt>Career focus</dt>
              <dd>
                {profile.careerFocus ||
                  'Describe the work and impact you are seeking.'}
              </dd>
            </div>
          </dl>
        </PageCard>
      </div>
    </div>
  )
}

function loadLocalProfile() {
  try {
    const savedProfile =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      )

    if (!savedProfile) {
      return emptyProfile
    }

    return {
      ...emptyProfile,
      ...JSON.parse(savedProfile),
    }
  } catch (error) {
    console.error(
      'Unable to read the previous browser profile:',
      error
    )

    return emptyProfile
  }
}

function hasMeaningfulProfileData(profile) {
  return Boolean(
    profile.name?.trim() ||
      profile.targetRole?.trim() ||
      profile.location?.trim() ||
      profile.careerFocus?.trim()
  )
}

export default ProfilePage