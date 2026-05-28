import { getFacebookPage } from './facebook'

const IG_KEY = 'ig_account'

export interface InstagramAccount {
  id: string
  username: string
}

export function getInstagramAccount(): InstagramAccount | null {
  const raw = localStorage.getItem(IG_KEY)
  return raw ? JSON.parse(raw) : null
}

export function isInstagramConnected() {
  return !!getInstagramAccount()
}

export function clearInstagramAccount() {
  localStorage.removeItem(IG_KEY)
}

export async function connectInstagram(): Promise<InstagramAccount> {
  const page = getFacebookPage()
  if (!page) throw new Error('Connect Facebook first')

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
  )
  if (!res.ok) throw new Error('Failed to fetch Instagram account')
  const data = await res.json()

  const igId = data.instagram_business_account?.id
  if (!igId) throw new Error('No Instagram Business account linked to your Facebook Page. Link it in Facebook Page Settings → Instagram.')

  const igRes = await fetch(
    `https://graph.facebook.com/v19.0/${igId}?fields=username&access_token=${page.access_token}`
  )
  if (!igRes.ok) throw new Error('Failed to fetch Instagram username')
  const igData = await igRes.json()

  const account: InstagramAccount = { id: igId, username: igData.username ?? 'Instagram Account' }
  localStorage.setItem(IG_KEY, JSON.stringify(account))
  return account
}

async function uploadImageToFacebook(image: File, pageId: string, pageToken: string): Promise<string> {
  const formData = new FormData()
  formData.append('source', image)
  formData.append('published', 'false')
  formData.append('access_token', pageToken)

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to upload image')
  }
  const { id } = await res.json()

  const urlRes = await fetch(
    `https://graph.facebook.com/v19.0/${id}?fields=images&access_token=${pageToken}`
  )
  if (!urlRes.ok) throw new Error('Failed to get image URL')
  const urlData = await urlRes.json()
  const images: { source: string; width: number }[] = urlData.images ?? []
  const largest = images.sort((a, b) => b.width - a.width)[0]
  if (!largest) throw new Error('No image URL returned from Facebook')
  return largest.source
}

export async function postImageToInstagram(caption: string, image: File): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('Facebook Page not connected')

  const igAccount = getInstagramAccount()
  if (!igAccount) throw new Error('Instagram not connected')

  const imageUrl = await uploadImageToFacebook(image, page.id, page.access_token)

  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccount.id}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: page.access_token,
      }),
    }
  )
  if (!containerRes.ok) {
    const err = await containerRes.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to create Instagram post')
  }
  const { id: creationId } = await containerRes.json()

  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccount.id}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: page.access_token,
      }),
    }
  )
  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to publish to Instagram')
  }
  const { id: postId } = await publishRes.json()
  return `https://www.instagram.com/p/${postId}`
}

async function waitForContainer(_igAccountId: string, creationId: string, token: string): Promise<void> {
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${token}`
    )
    const data = await res.json()
    if (data.status_code === 'FINISHED') return
    if (data.status_code === 'ERROR') throw new Error('Instagram video processing failed')
  }
  throw new Error('Instagram video processing timed out — try a shorter video')
}

export async function postVideoToInstagram(
  caption: string,
  video: File,
  onProgress: (pct: number) => void
): Promise<string> {
  const page = getFacebookPage()
  if (!page) throw new Error('Facebook Page not connected')

  const igAccount = getInstagramAccount()
  if (!igAccount) throw new Error('Instagram not connected')

  onProgress(5)

  // Step 1: Initialize resumable upload session directly with Instagram
  const initRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccount.id}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        upload_type: 'resumable',
        caption,
        access_token: page.access_token,
      }),
    }
  )
  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to initialize video upload')
  }
  const initData = await initRes.json()
  const creationId: string = initData.id
  const uploadUri: string = initData.uri

  if (!uploadUri) throw new Error('No upload URI returned from Instagram')
  onProgress(10)

  // Step 2: Upload video directly to Instagram's upload URI
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadUri)
    xhr.setRequestHeader('Authorization', `OAuth ${page.access_token}`)
    xhr.setRequestHeader('offset', '0')
    xhr.setRequestHeader('file_size', video.size.toString())

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(10 + Math.round((e.loaded / e.total) * 70))
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve()
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
    xhr.send(video)
  })

  onProgress(85)

  // Step 3: Wait for Instagram to finish processing the video
  await waitForContainer(igAccount.id, creationId, page.access_token)
  onProgress(95)

  // Step 4: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccount.id}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: page.access_token,
      }),
    }
  )
  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Failed to publish Instagram Reel')
  }
  onProgress(100)
  const { id: postId } = await publishRes.json()
  return `https://www.instagram.com/p/${postId}`
}
