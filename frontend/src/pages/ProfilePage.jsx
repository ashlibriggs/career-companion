import { useState } from 'react'

import Button from '../components/Button'
import PageCard from '../components/PageCard'
import './MvpPages.css'

const PROFILE_STORAGE_KEY = 'career-companion-profile'

const emptyProfile = {
  name: '',
  targetRole: '',
  location: '',
  weeklyApplicationGoal: '5',
  careerFocus: '',
}

function ProfilePage() {
  const [profile, setProfile] = useState(() => loadProfile())
  const [saveMessage, setSaveMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))

    setSaveMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    )

    setSaveMessage('Profile saved.')
  }

  function handleReset() {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    setProfile(emptyProfile)
    setSaveMessage('Profile cleared.')
  }

  return (
    <div className="mvp-page profile-page">
      <header className="mvp-page__header">
        <p className="mvp-page__eyebrow">
          Career direction
        </p>

        <h1>Your career profile</h1>

        <p className="mvp-page__intro">
          Keep your current goals visible so the rest of your
          job search remains focused and intentional.
        </p>
      </header>

      <div className="mvp-page__grid mvp-page__grid--two-column">
        <PageCard
          title="Profile details"
          description="Update the information guiding your search."
        >
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
                placeholder="Example: Remote or Dallas–Fort Worth"
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="profile-weekly-goal">
                Weekly application goal
              </label>

              <select
                id="profile-weekly-goal"
                name="weeklyApplicationGoal"
                value={profile.weeklyApplicationGoal}
                onChange={handleChange}
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
              />
            </div>

            <div className="form-actions">
              <Button type="submit">
                Save profile
              </Button>

              <button
                className="text-button"
                type="button"
                onClick={handleReset}
              >
                Clear profile
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
        </PageCard>

        <PageCard
          title="Career direction"
          description="Your current job-search focus at a glance."
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
                {profile.weeklyApplicationGoal} focused
                applications
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

function loadProfile() {
  try {
    const savedProfile = localStorage.getItem(
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
    console.error('Unable to load profile:', error)
    return emptyProfile
  }
}

export default ProfilePage