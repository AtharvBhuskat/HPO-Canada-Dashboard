const APP_ID = import.meta.env.VITE_FB_APP_ID
const APP_SECRET = import.meta.env.VITE_FB_APP_SECRET
const REDIRECT_URI = `${window.location.origin}/auth/facebook`

const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
].join(',')

const TOKEN_KEY = 'fb_tokens'
const PAGE_KEY = 'fb_page'

export interface FacebookPage {
  id: string
  name: string
  access_token: string
}

export function getFacebookOAuthURL() {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    response_type: 'code',
    auth_type: 'rerequest',
  })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
}

export async function exchangeFacebookCode(code: string) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: APP_ID,
      client_secret: APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    })
  )
  if (!res.ok) throw new Error('Facebook token exchange failed')
  const tokens = await res.json()
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))

  // Fetch and store the first Facebook Page automatically
  await fetchAndStorePage(tokens.access_token)
  return tokens
}

export async function fetchAndStorePage(userToken: string) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`
  )
  if (!res.ok) return null
  const data = await res.json()
  if (data.data && data.data.length > 0) {
    const page = data.data[0]
    localStorage.setItem(PAGE_KEY, JSON.stringify({
      id: page.id,
      name: page.name,
      access_token: page.access_token,
    }))
    return page
  }
  return null
}

export function getFacebookPage(): FacebookPage | null {
  const raw = localStorage.getItem(PAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function getFacebookTokens() {
  const raw = localStorage.getItem(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearFacebookTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PAGE_KEY)
}

export function isFacebookConnected() {
  return !!getFacebookTokens()
}

export async function postToFacebookPage(
  message: string,
  link?: string
): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('No Facebook Page connected')

  const body: Record<string, string> = {
    message,
    access_token: page.access_token,
  }
  if (link) body.link = link

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${page.id}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to post to Facebook')
  }

  const data = await res.json()
  return `https://www.facebook.com/${data.id}`
}

export async function postPhotoToFacebookPage(
  message: string,
  image: File
): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('No Facebook Page connected')

  const formData = new FormData()
  formData.append('source', image)
  formData.append('message', message)
  formData.append('access_token', page.access_token)

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${page.id}/photos`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to upload photo to Facebook')
  }

  const data = await res.json()
  return `https://www.facebook.com/${page.id}/photos/${data.id}`
}
