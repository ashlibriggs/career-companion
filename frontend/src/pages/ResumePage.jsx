import { useState } from 'react'

import Button from '../components/Button'
import PageCard from '../components/PageCard'
import './MvpPages.css'

const RESUME_STORAGE_KEY = 'career-companion-resume'

const emptyResume = {
  targetRole: '',
  professionalSummary: '',
  skills: '',
  experienceHighlights: '',
}

function ResumePage() {
  const [resume, setResume] = useState(() => loadResume())
  const [saveMessage, setSaveMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setResume((currentResume) => ({
      ...currentResume,
      [name]: value,
    }))

    setSaveMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    localStorage.setItem(
      RESUME_STORAGE_KEY,
      JSON.stringify(resume)
    )

    setSaveMessage('Resume workspace saved.')
  }

  function handleReset() {
    localStorage.removeItem(RESUME_STORAGE_KEY)
    setResume(emptyResume)
    setSaveMessage('Resume workspace cleared.')
  }

  return (
    <div className="mvp-page resume-page">
      <header className="mvp-page__header">
        <p className="mvp-page__eyebrow">
          Application materials
        </p>

        <h1>Build your resume foundation</h1>

        <p className="mvp-page__intro">
          Capture the core information you want to tailor for
          future applications. Your work is saved in this
          browser.
        </p>
      </header>

      <div className="mvp-page__grid mvp-page__grid--two-column">
        <PageCard
          title="Resume workspace"
          description="Add focused content you can refine for each opportunity."
        >
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
              />
            </div>

            <div className="form-field">
              <label htmlFor="resume-summary">
                Professional summary
              </label>

              <p className="form-field__hint">
                Write two to four sentences connecting your
                experience, technical skills, and target role.
              </p>

              <textarea
                id="resume-summary"
                name="professionalSummary"
                value={resume.professionalSummary}
                placeholder="Describe the value you bring..."
                onChange={handleChange}
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
              />
            </div>

            <div className="form-field">
              <label htmlFor="resume-experience">
                Experience highlights
              </label>

              <p className="form-field__hint">
                Capture measurable accomplishments or strong
                project examples.
              </p>

              <textarea
                id="resume-experience"
                name="experienceHighlights"
                value={resume.experienceHighlights}
                placeholder="Built a React application that..."
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <Button type="submit">
                Save resume workspace
              </Button>

              <button
                className="text-button"
                type="button"
                onClick={handleReset}
              >
                Clear workspace
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

function loadResume() {
  try {
    const savedResume = localStorage.getItem(
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
    console.error('Unable to load resume workspace:', error)
    return emptyResume
  }
}

export default ResumePage