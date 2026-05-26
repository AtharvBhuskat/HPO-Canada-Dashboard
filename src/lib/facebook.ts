const APP_ID = import.meta.env.VITE_FB_APP_ID
const APP_SECRET = import.meta.env.VITE_FB_APP_SECRET
const REDIRECT_URI = `${window.location.origin}/auth/facebook`

const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_metadata',
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

// Text / link post
export async function postToFacebookPage(message: string, link?: string): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('No Facebook Page connected')
  const body: Record<string, string> = { message, access_token: page.access_token }
  if (link) body.link = link
  const res = await fetch(`https://graph.facebook.com/v19.0/${page.id}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to post to Facebook')
  }
  const data = await res.json()
  return `https://www.facebook.com/${data.id}`
}

// Single photo post
export async function postPhotoToFacebookPage(message: string, image: File): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('No Facebook Page connected')
  const formData = new FormData()
  formData.append('source', image)
  formData.append('message', message)
  formData.append('access_token', page.access_token)
  const res = await fetch(`https://graph.facebook.com/v19.0/${page.id}/photos`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to upload photo')
  }
  const data = await res.json()
  return `https://www.facebook.com/${page.id}/photos/${data.id}`
}

// Multi-photo post (up to 10 images)
export async function postMultiplePhotosToFacebookPage(message: string, images: File[]): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('No Facebook Page connected')

  // Step 1: upload each photo as unpublished
  const photoIds: string[] = []
  for (const image of images) {
    const formData = new FormData()
    formData.append('source', image)
    formData.append('published', 'false')
    formData.append('access_token', page.access_token)
    const res = await fetch(`https://graph.facebook.com/v19.0/${page.id}/photos`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? 'Failed to upload photo')
    }
    const data = await res.json()
    photoIds.push(data.id)
  }

  // Step 2: publish as a single multi-photo post
  const body: Record<string, unknown> = {
    message,
    access_token: page.access_token,
    attached_media: photoIds.map(id => ({ media_fbid: id })),
  }
  const res = await fetch(`https://graph.facebook.com/v19.0/${page.id}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to publish multi-photo post')
  }
  const data = await res.json()
  return `https://www.facebook.com/${data.id}`
}

// Video post
export async function postVideoToFacebookPage(
  title: string,
  description: string,
  video: File,
  onProgress: (pct: number) => void
): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('No Facebook Page connected')

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('source', video)
    formData.append('title', title)
    formData.append('description', description)
    formData.append('access_token', page.access_token)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://graph-video.facebook.com/v19.0/${page.id}/videos`)

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve(`https://www.facebook.com/${page.id}/videos/${data.id}`)
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err?.error?.message ?? `Upload failed: ${xhr.status}`))
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Video upload failed — network error'))
    xhr.send(formData)
  })
}
