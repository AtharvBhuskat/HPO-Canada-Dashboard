const CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID as string
const REDIRECT_URI = `${window.location.origin}/auth/linkedin`
const API_BASE = 'https://4mtxj04f6d.execute-api.us-east-1.amazonaws.com/default'

const STORAGE_KEY = 'linkedin_tokens'


export interface LinkedInTokens {
  access_token: string
  expires_in: number
  stored_at: number
  person_id?: string
  person_name?: string
}

export function getLinkedInAuthUrl(): string {
  const state = crypto.randomUUID()
  sessionStorage.setItem('linkedin_state', state)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email w_member_social',
    state,
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export async function exchangeLinkedInCode(code: string): Promise<LinkedInTokens> {
  const res = await fetch(`${API_BASE}/linkedin/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Token exchange failed')

  const tokens: LinkedInTokens = {
    access_token: data.access_token,
    expires_in: data.expires_in,
    stored_at: Date.now(),
  }

  try {
    const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    const me = await meRes.json()
    tokens.person_id = me.sub
    tokens.person_name = me.name
  } catch { /* non-fatal */ }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  return tokens
}

export function getLinkedInTokens(): LinkedInTokens | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const tokens: LinkedInTokens = JSON.parse(raw)
    if (Date.now() > tokens.stored_at + tokens.expires_in * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return tokens
  } catch { return null }
}

export function isLinkedInConnected(): boolean {
  return getLinkedInTokens() !== null
}

export function clearLinkedInTokens(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Fetch person ID on demand via Lambda ──────────────────────────────────────

async function resolvePersonId(tokens: LinkedInTokens): Promise<string> {
  if (tokens.person_id) return tokens.person_id

  const res = await fetch(`${API_BASE}/linkedin/userinfo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: tokens.access_token }),
  })
  if (!res.ok) throw new Error('Could not fetch LinkedIn profile — please reconnect')
  const me = await res.json()
  if (!me.sub) throw new Error('LinkedIn profile ID missing — please reconnect')

  const updated = { ...tokens, person_id: me.sub, person_name: me.name }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return me.sub
}

// ── Text post ────────────────────────────────────────────────────────────────

export async function postToLinkedIn(text: string): Promise<string> {
  const tokens = getLinkedInTokens()
  if (!tokens) throw new Error('LinkedIn not connected — reconnect')
  const personId = await resolvePersonId(tokens)

  const res = await fetch(`${API_BASE}/linkedin/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: tokens.access_token, person_id: personId, text }),
  })

  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error ?? `LinkedIn post failed (${res.status})`)
  return data.post_url ?? 'https://www.linkedin.com/feed/'
}

// ── Image post ───────────────────────────────────────────────────────────────

export async function postImageToLinkedIn(
  text: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const tokens = getLinkedInTokens()
  if (!tokens) throw new Error('LinkedIn not connected — reconnect')
  const personId = await resolvePersonId(tokens)

  // Step 1: Initialize image upload via Lambda
  const initRes = await fetch(`${API_BASE}/linkedin/image-init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: tokens.access_token, person_id: personId }),
  })
  const initData = await initRes.json()
  if (!initRes.ok || initData.error) throw new Error(initData.error ?? 'Failed to initialize image upload')
  const { upload_url, image_urn } = initData

  onProgress?.(20)

  // Step 2: Upload image directly to LinkedIn storage URL
  await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  onProgress?.(70)

  // Step 3: Create post via Lambda
  const postRes = await fetch(`${API_BASE}/linkedin/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: tokens.access_token, person_id: personId, text, media_id: image_urn }),
  })

  const postData = await postRes.json()
  if (!postRes.ok || postData.error) throw new Error(postData.error ?? 'LinkedIn image post failed')

  onProgress?.(100)
  return postData.post_url ?? 'https://www.linkedin.com/feed/'
}

// ── Video post ───────────────────────────────────────────────────────────────

export async function postVideoToLinkedIn(
  text: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const tokens = getLinkedInTokens()
  if (!tokens) throw new Error('LinkedIn not connected — reconnect')
  const personId = await resolvePersonId(tokens)

  // Step 1: Initialize video upload via Lambda
  const initRes = await fetch(`${API_BASE}/linkedin/video-init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: tokens.access_token, person_id: personId, file_size: file.size }),
  })
  const initData = await initRes.json()
  if (!initRes.ok || initData.error) throw new Error(initData.error ?? 'Failed to initialize video upload')
  const { upload_instructions, video_urn } = initData

  onProgress?.(10)

  // Step 2: Upload chunks directly to LinkedIn storage URLs
  const etags: string[] = []
  for (let i = 0; i < upload_instructions.length; i++) {
    const { uploadUrl, firstByte, lastByte } = upload_instructions[i]
    const chunk = file.slice(firstByte, lastByte + 1)
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: chunk,
    })
    etags.push(uploadRes.headers.get('ETag') ?? '')
    onProgress?.(10 + Math.round(((i + 1) / upload_instructions.length) * 60))
  }

  // Step 3: Finalize via Lambda
  await fetch(`${API_BASE}/linkedin/video-finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: tokens.access_token, video_urn, etags }),
  })

  onProgress?.(80)

  // Step 4: Create post via Lambda
  const postRes = await fetch(`${API_BASE}/linkedin/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: tokens.access_token, person_id: personId, text, media_id: video_urn }),
  })

  const postData = await postRes.json()
  if (!postRes.ok || postData.error) throw new Error(postData.error ?? 'LinkedIn video post failed')

  onProgress?.(100)
  return postData.post_url ?? 'https://www.linkedin.com/feed/'
}
