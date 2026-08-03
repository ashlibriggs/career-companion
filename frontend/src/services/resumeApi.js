const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001'

const RESUME_API_URL =
  `${API_BASE_URL}/api/resume`

async function request(options = {}) {
  let response

  try {
    response = await fetch(RESUME_API_URL, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
  } catch {
    throw new Error(
      'Unable to connect to your resume workspace.'
    )
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const error = new Error(
      data.error ||
        'Unable to complete the resume request.'
    )

    error.status = response.status
    throw error
  }

  return data
}

export function normalizeResume(resume = {}) {
  return {
    id: resume.id ?? null,
    targetRole: resume.target_role || '',
    professionalSummary:
      resume.professional_summary || '',
    skills: resume.skills || '',
    experienceHighlights:
      resume.experience_highlights || '',
    createdAt: resume.created_at || null,
    updatedAt: resume.updated_at || null,
    userId: resume.user_id ?? null,
  }
}

function createResumePayload(resume) {
  return {
    target_role: resume.targetRole,
    professional_summary:
      resume.professionalSummary,
    skills: resume.skills,
    experience_highlights:
      resume.experienceHighlights,
  }
}

export async function getResume() {
  const resume = await request()

  return normalizeResume(resume)
}

export async function saveResume(resume) {
  const savedResume = await request({
    method: 'PUT',
    body: JSON.stringify(
      createResumePayload(resume)
    ),
  })

  return normalizeResume(savedResume)
}

export async function clearResume() {
  const clearedResume = await request({
    method: 'DELETE',
  })

  return normalizeResume(clearedResume)
}