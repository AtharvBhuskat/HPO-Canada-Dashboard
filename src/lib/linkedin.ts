const CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET as string
const REDIRECT_URI = `${window.location.origin}/auth/linkedin`

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
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Token exchange failed')

  const tokens: LinkedInTokens = {
    access_token: data.access_token,
    expires_in: data.expires_in,
    stored_at: Date.now(),
  }

  // Fetch user info (person ID needed for posting)
  try {
    const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    const me = await meRes.json()
    tokens.person_id = me.sub
    tokens.person_name = me.name
  } catch {
    // non-fatal
  }

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
  } catch {
    return null
  }
}

export function isLinkedInConnected(): boolean {
  return getLinkedInTokens() !== null
}

export function clearLinkedInTokens(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function postToLinkedIn(text: string): Promise<string> {
  const tokens = getLinkedInTokens()
  if (!tokens) throw new Error('LinkedIn not connected')
  if (!tokens.person_id) throw new Error('Person ID missing — reconnect LinkedIn')

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${tokens.person_id}`,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
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
