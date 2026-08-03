const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001'

const PROFILE_API_URL =
  `${API_BASE_URL}/api/profile`

async function request(options = {}) {
  let response

  try {
    response = await fetch(PROFILE_API_URL, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
  } catch {
    throw new Error(
      'Unable to connect to your career profile.'
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
        'Unable to complete the profile request.'
    )

    error.status = response.status
    throw error
  }

  return data
}

export function normalizeProfile(profile = {}) {
  return {
    id: profile.id ?? null,
    name: profile.name || '',
    targetRole: profile.target_role || '',
    location: profile.location || '',
    weeklyApplicationGoal: String(
      profile.weekly_application_goal || 5
    ),
    careerFocus: profile.career_focus || '',
    createdAt: profile.created_at || null,
    updatedAt: profile.updated_at || null,
    userId: profile.user_id ?? null,
  }
}

function createProfilePayload(profile) {
  return {
    name: profile.name,
    target_role: profile.targetRole,
    location: profile.location,
    weekly_application_goal:
      Number(profile.weeklyApplicationGoal) || 5,
    career_focus: profile.careerFocus,
  }
}

export async function getProfile() {
  const profile = await request()

  return normalizeProfile(profile)
}

export async function saveProfile(profile) {
  const savedProfile = await request({
    method: 'PUT',
    body: JSON.stringify(
      createProfilePayload(profile)
    ),
  })

  return normalizeProfile(savedProfile)
}

export async function clearProfile() {
  const clearedProfile = await request({
    method: 'DELETE',
  })

  return normalizeProfile(clearedProfile)
}