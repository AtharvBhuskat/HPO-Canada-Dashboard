const CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY as string
const CLIENT_SECRET = import.meta.env.VITE_TIKTOK_CLIENT_SECRET as string
const REDIRECT_URI = `${window.location.origin}/auth/tiktok`
const API_BASE = import.meta.env.VITE_API_BASE_URL as string

const STORAGE_KEY = 'tiktok_tokens'
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

export interface TikTokTokens {
  access_token: string
  open_id: string
  expires_in: number
  stored_at: number
}

export function getTikTokAuthUrl(): string {
  const state = crypto.randomUUID()
  sessionStorage.setItem('tiktok_state', state)

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: 'user.info.basic,video.upload,video.publish',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
  })

  return `https://www.tiktok.com/v2/auth/authorize/?${params}`
}

export async function exchangeTikTokCode(code: string): Promise<TikTokTokens> {
  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error_description ?? data.error)

  const tokens: TikTokTokens = {
    access_token: data.access_token,
    open_id: data.open_id,
    expires_in: data.expires_in,
    stored_at: Date.now(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  return tokens
}

export function getTikTokTokens(): TikTokTokens | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const tokens: TikTokTokens = JSON.parse(raw)
    if (Date.now() > tokens.stored_at + tokens.expires_in * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return tokens
  } catch {
    return null
  }
}

export function isTikTokConnected(): boolean {
  return getTikTokTokens() !== null
}

export function clearTikTokTokens(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function uploadVideoToTikTok(
  file: File,
  title: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const tokens = getTikTokTokens()
  if (!tokens) throw new Error('TikTok not connected')

  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))

  // Step 1: Initialize upload via Lambda proxy (avoids CORS)
  const initRes = await fetch(`${API_BASE}/tiktok/upload-init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: tokens.access_token,
      title: title.slice(0, 150),
      video_size: file.size,
      chunk_size: CHUNK_SIZE,
      total_chunk_count: totalChunks,
    }),
  })

  const initData = await initRes.json()
  if (initData.error?.code !== 'ok') {
    throw new Error(initData.error?.message ?? 'Failed to initialize upload')
  }

  const { publish_id, upload_url } = initData.data

  // Step 2: Upload chunks directly to cloud storage URL
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(chunk.size),
        'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
      },
      body: chunk,
    })

    onProgress?.(Math.round(((i + 1) / totalChunks) * 85))
  }

  // Step 3: Poll processing status
  onProgress?.(90)
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 2000))

    const statusRes = await fetch(`${API_BASE}/tiktok/upload-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: tokens.access_token, publish_id }),
    })

    const statusData = await statusRes.json()
    const status = statusData.data?.status

    if (status === 'PUBLISH_COMPLETE' || status === 'PROCESSING_DOWNLOAD') {
      onProgress?.(100)
      return
    }
    if (status === 'FAILED') {
      throw new Error(statusData.data?.fail_reason ?? 'TikTok processing failed')
    }
  }

  onProgress?.(100)
}
