import { useEffect, useState } from 'react'

import Button from '../components/Button'
import PageCard from '../components/PageCard'
import {
  clearResume,
  getResume,
  saveResume,
} from '../services/resumeApi'
import './MvpPages.css'

const RESUME_STORAGE_KEY =
  'career-companion-resume'

const emptyResume = {
  id: null,
  targetRole: '',
  professionalSummary: '',
  skills: '',
  experienceHighlights: '',
}

function ResumePage() {
  const [resume, setResume] =
    useState(emptyResume)
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

    async function loadResume() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        let storedResume = await getResume()
        const localResume = loadLocalResume()

        if (
          !storedResume.id &&
          hasMeaningfulResumeData(localResume)
        ) {
          storedResume =
            await saveResume(localResume)

          localStorage.removeItem(
            RESUME_STORAGE_KEY
          )
        }

        if (isMounted) {
          setResume(storedResume)
        }
      } catch (error) {
        console.error(
          'Unable to load resume workspace:',
          error
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'Unable to load your resume workspace.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadResume()

    return () => {
      isMounted = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setResume((currentResume) => ({
      ...currentResume,
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

      const savedResume =
        await saveResume(resume)

      setResume(savedResume)

      localStorage.removeItem(
        RESUME_STORAGE_KEY
      )

      setSaveMessage(
        'Resume workspace saved to your account.'
      )
    } catch (error) {
      console.error(
        'Unable to save resume workspace:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to save your resume workspace.'
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

      const clearedResume =
        await clearResume()

      setResume(clearedResume)

      localStorage.removeItem(
        RESUME_STORAGE_KEY
      )

      setSaveMessage(
        'Resume workspace cleared.'
      )
    } catch (error) {
      console.error(
        'Unable to clear resume workspace:',
        error
      )

      setErrorMessage(
        error.message ||
          'Unable to clear your resume workspace.'
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
    <div className="mvp-page resume-page">
      <header className="mvp-page__header">
        <p className="mvp-page__eyebrow">
          Application materials
        </p>

        <h1>Build your resume foundation</h1>

        <p className="mvp-page__intro">
          Capture the core information you want to
          tailor for future applications. Your resume
          workspace is securely saved to your Career
          Companion account.
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
          title="Resume workspace"
          description="Add focused content you can refine for each opportunity."
        >
          {isLoading ? (
            <div className="mvp-callout">
              <h3>Loading your resume workspace</h3>

              <p>
                We’re retrieving your saved resume
                foundation from your account.
              </p>
            </div>
          ) : (
            <form
              className="form-grid"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="resume-target-role">
                  Target role
                </label>

                <input
                  id="resume-target-role"
                  name="targetRole"
                  type="text"
                  value={resume.targetRole}
                  placeholder="Example: Junior Frontend Engineer"
                  onChange={handleChange}
                  disabled={isBusy}
                  maxLength={200}
                />
              </div>

              <div className="form-field">
                <label htmlFor="resume-summary">
                  Professional summary
                </label>

                <p className="form-field__hint">
                  Write two to four sentences connecting
                  your experience, technical skills, and
                  target role.
                </p>

                <textarea
                  id="resume-summary"
                  name="professionalSummary"
                  value={
                    resume.professionalSummary
                  }
                  placeholder="Describe the value you bring..."
                  onChange={handleChange}
                  disabled={isBusy}
                />
              </div>

              <div className="form-field">
                <label htmlFor="resume-skills">
                  Technical skills
                </label>

                <p className="form-field__hint">
                  Separate skills with commas.
                </p>

                <textarea
                  id="resume-skills"
                  name="skills"
                  value={resume.skills}
                  placeholder="JavaScript, React, Python, APIs..."
                  onChange={handleChange}
                  disabled={isBusy}
                />
              </div>

              <div className="form-field">
                <label htmlFor="resume-experience">
                  Experience highlights
                </label>

                <p className="form-field__hint">
                  Capture measurable accomplishments or
                  strong project examples.
                </p>

                <textarea
                  id="resume-experience"
                  name="experienceHighlights"
                  value={
                    resume.experienceHighlights
                  }
                  placeholder="Built a React application that..."
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
                    ? 'Saving workspace...'
                    : 'Save resume workspace'}
                </Button>

                <button
                  className="text-button"
                  type="button"
                  onClick={handleClear}
                  disabled={isBusy}
                >
                  {isClearing
                    ? 'Clearing workspace...'
                    : 'Clear workspace'}
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
          title="Current snapshot"
          description="A quick view of what you have prepared."
        >
          <dl className="summary-list">
            <div>
              <dt>Target role</dt>
              <dd>
                {resume.targetRole ||
                  'Add the role you are targeting.'}
              </dd>
            </div>

            <div>
              <dt>Summary</dt>
              <dd>
                {resume.professionalSummary ||
                  'Your professional summary will appear here.'}
              </dd>
            </div>

            <div>
              <dt>Skills</dt>
              <dd>
                {resume.skills ||
                  'Add the technical skills you want to highlight.'}
              </dd>
            </div>

            <div>
              <dt>Experience</dt>
              <dd>
                {resume.experienceHighlights ||
                  'Add project or professional accomplishments.'}
              </dd>
            </div>
          </dl>
        </PageCard>
      </div>
    </div>
  )
}

function loadLocalResume() {
  try {
    const savedResume =
      localStorage.getItem(
        RESUME_STORAGE_KEY
      )

    if (!savedResume) {
      return emptyResume
    }

    return {
      ...emptyResume,
      ...JSON.parse(savedResume),
    }
  } catch (error) {
    console.error(
      'Unable to read the previous browser resume:',
      error
    )

    return emptyResume
  }
}

function hasMeaningfulResumeData(resume) {
  return Boolean(
    resume.targetRole?.trim() ||
      resume.professionalSummary?.trim() ||
      resume.skills?.trim() ||
      resume.experienceHighlights?.trim()
  )
}

export default ResumePage