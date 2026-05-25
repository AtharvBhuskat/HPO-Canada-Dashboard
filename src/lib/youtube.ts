const CLIENT_ID = import.meta.env.VITE_YT_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_YT_CLIENT_SECRET
const REDIRECT_URI = `${window.location.origin}/auth/youtube`

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ')

const TOKEN_KEY = 'yt_tokens'

export function getOAuthURL() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error('Token exchange failed')
  const tokens = await res.json()
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  return tokens
}

export function getTokens() {
  const raw = localStorage.getItem(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isConnected() {
  return !!getTokens()
}

export async function uploadVideo(
  file: File,
  title: string,
  description: string,
  onProgress: (pct: number) => void
): Promise<string> {
  const tokens = getTokens()
  if (!tokens) throw new Error('Not connected to YouTube')

  const metadata = {
    snippet: { title, description, categoryId: '22' },
    status: { privacyStatus: 'public' },
  }

  // Initiate resumable upload
  const initRes = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': file.type,
        'X-Upload-Content-Length': String(file.size),
      },
      body: JSON.stringify(metadata),
    }
  )

  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to initiate upload')
  }

  const uploadUrl = initRes.headers.get('Location')
  if (!uploadUrl) throw new Error('No upload URL returned')

  // Upload the file with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const data = JSON.parse(xhr.responseText)
        resolve(`https://www.youtube.com/watch?v=${data.id}`)
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed — network error'))
    xhr.send(file)
  })
}
