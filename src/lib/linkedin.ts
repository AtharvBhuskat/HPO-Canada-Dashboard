const CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID as string
const REDIRECT_URI = `${window.location.origin}/auth/linkedin`
const API_BASE = 'https://4mtxj04f6d.execute-api.us-east-1.amazonaws.com/default'

const STORAGE_KEY = 'linkedin_tokens'

const LI_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'LinkedIn-Version': '202401',
  'X-Restli-Protocol-Version': '2.0.0',
})

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

// ── Text post ────────────────────────────────────────────────────────────────

export async function postToLinkedIn(text: string): Promise<string> {
  const tokens = getLinkedInTokens()
  if (!tokens?.person_id) throw new Error('LinkedIn not connected — reconnect')

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: LI_HEADERS(tokens.access_token),
    body: JSON.stringify({
      author: `urn:li:person:${tokens.person_id}`,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `LinkedIn post failed (${res.status})`)
  }
  const postId = res.headers.get('x-restli-id') ?? ''
  return `https://www.linkedin.com/feed/update/${postId}`
}

// ── Image post ───────────────────────────────────────────────────────────────

export async function postImageToLinkedIn(
  text: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const tokens = getLinkedInTokens()
  if (!tokens?.person_id) throw new Error('LinkedIn not connected — reconnect')

  // Step 1: Initialize image upload
  const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: LI_HEADERS(tokens.access_token),
    body: JSON.stringify({ initializeUploadRequest: { owner: `urn:li:person:${tokens.person_id}` } }),
  })
  if (!initRes.ok) throw new Error('Failed to initialize image upload')
  const initData = await initRes.json()
  const { uploadUrl, image: imageUrn } = initData.value

  onProgress?.(20)

  // Step 2: Upload image binary
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  onProgress?.(70)

  // Step 3: Create post with image
  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: LI_HEADERS(tokens.access_token),
    body: JSON.stringify({
      author: `urn:li:person:${tokens.person_id}`,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { media: { id: imageUrn } },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  })

  if (!postRes.ok) {
    const err = await postRes.json().catch(() => ({}))
    throw new Error(err.message ?? `LinkedIn image post failed (${postRes.status})`)
  }

  onProgress?.(100)
  const postId = postRes.headers.get('x-restli-id') ?? ''
  return `https://www.linkedin.com/feed/update/${postId}`
}

// ── Video post ───────────────────────────────────────────────────────────────

export async function postVideoToLinkedIn(
  text: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const tokens = getLinkedInTokens()
  if (!tokens?.person_id) throw new Error('LinkedIn not connected — reconnect')

  // Step 1: Initialize video upload
  const initRes = await fetch('https://api.linkedin.com/rest/videos?action=initializeUpload', {
    method: 'POST',
    headers: LI_HEADERS(tokens.access_token),
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: `urn:li:person:${tokens.person_id}`,
        fileSizeBytes: file.size,
        uploadCaptions: false,
        uploadThumbnail: false,
      },
    }),
  })
  if (!initRes.ok) throw new Error('Failed to initialize video upload')
  const initData = await initRes.json()
  const { uploadInstructions, video: videoUrn } = initData.value

  onProgress?.(10)

  // Step 2: Upload each chunk
  const etags: { partNumber: number; eTag: string }[] = []
  for (let i = 0; i < uploadInstructions.length; i++) {
    const { uploadUrl, firstByte, lastByte, partNumber } = uploadInstructions[i]
    const chunk = file.slice(firstByte, lastByte + 1)
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: chunk,
    })
    const eTag = uploadRes.headers.get('ETag') ?? ''
    etags.push({ partNumber, eTag })
    onProgress?.(10 + Math.round(((i + 1) / uploadInstructions.length) * 60))
  }

  // Step 3: Finalize upload
  await fetch('https://api.linkedin.com/rest/videos?action=finalizeUpload', {
    method: 'POST',
    headers: LI_HEADERS(tokens.access_token),
    body: JSON.stringify({
      finalizeUploadRequest: { video: videoUrn, uploadToken: '', uploadedPartIds: etags.map(e => e.eTag) },
    }),
  })

  onProgress?.(80)

  // Step 4: Create post with video
  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: LI_HEADERS(tokens.access_token),
    body: JSON.stringify({
      author: `urn:li:person:${tokens.person_id}`,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { media: { id: videoUrn } },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  })

  if (!postRes.ok) {
    const err = await postRes.json().catch(() => ({}))
    throw new Error(err.message ?? `LinkedIn video post failed (${postRes.status})`)
  }

  onProgress?.(100)
  const postId = postRes.headers.get('x-restli-id') ?? ''
  return `https://www.linkedin.com/feed/update/${postId}`
}
