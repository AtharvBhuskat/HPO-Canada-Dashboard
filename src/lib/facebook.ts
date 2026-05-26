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
  return tokens
}

export function getFacebookTokens() {
  const raw = localStorage.getItem(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearFacebookTokens() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isFacebookConnected() {
  return !!getFacebookTokens()
}
