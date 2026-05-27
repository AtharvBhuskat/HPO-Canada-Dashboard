import { useState, useRef } from 'react'
import { postImageToInstagram, postVideoToInstagram, getInstagramAccount } from '../lib/instagram'

interface Props {
  onClose: () => void
}

type PostType = 'photo' | 'video'

export default function InstagramPostModal({ onClose }: Props) {
  const [postType, setPostType] = useState<PostType>('photo')
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'error'>('idle')
  const [postUrl, setPostUrl] = useState('')
  const [error, setError] = useState('')

  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const account = getInstagramAccount()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImage(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setVideo(f)
  }

  const handlePost = async () => {
    setStatus('posting')
    setProgress(0)
    setError('')
    try {
      let url = ''
      if (postType === 'photo' && image) {
        url = await postImageToInstagram(caption, image)
      } else if (postType === 'video' && video) {
        url = await postVideoToInstagram(caption, video, setProgress)
      }
      setPostUrl(url)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Post failed')
    }
  }

  const canPost = !!account && status !== 'posting' && (
    (postType === 'photo' && !!image && caption.trim() !== '') ||
    (postType === 'video' && !!video && caption.trim() !== '')
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={status !== 'posting' ? onClose : undefined} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Post to Instagram</h3>
            <p className="text-zinc-500 text-xs">{account ? `@${account.username}` : 'Not connected'}</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Posted to Instagram!</p>
            <p className="text-zinc-500 text-sm mb-5">Your post is now live</p>
            <a href={postUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-medium transition-colors mb-3"
              style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Instagram
            </a>
            <br />
            <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 mt-2">Close</button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-[#111] rounded-xl p-1 border border-[#2a2a2a] mb-5">
              {([{ key: 'photo', label: 'Photo', icon: '🖼️' }, { key: 'video', label: 'Reel / Video', icon: '🎬' }] as const).map(t => (
                <button key={t.key} onClick={() => setPostType(t.key)}
                  className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                    postType === t.key
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  style={postType === t.key ? { background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' } : {}}>
                  <div>{t.icon}</div>
                  <div>{t.label}</div>
                </button>
              ))}
            </div>

            {/* Caption (shared) */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Caption</label>
              <textarea value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Write a caption..." rows={4}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-pink-500 transition-colors" />
              <p className="text-xs text-zinc-600 mt-1 text-right">{caption.length} chars</p>
            </div>

            {/* PHOTO */}
            {postType === 'photo' && (
              <div className="mb-5">
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Photo</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover rounded-xl border border-[#2a2a2a]" />
                    <button onClick={() => { setImage(null); setImagePreview(null) }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div onClick={() => photoRef.current?.click()}
                    className="border-2 border-dashed border-[#2a2a2a] hover:border-pink-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors">
                    <svg className="w-8 h-8 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-zinc-400 text-sm">Click to select a photo</p>
                    <p className="text-zinc-600 text-xs mt-1">JPG, PNG — square or portrait works best</p>
                  </div>
                )}
                <input ref={photoRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>
            )}

            {/* VIDEO */}
            {postType === 'video' && (
              <div className="mb-5">
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Video (Reel)</label>
                <div onClick={() => videoRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    video ? 'border-pink-500/50 bg-pink-500/5' : 'border-[#2a2a2a] hover:border-pink-500/50'
                  }`}>
                  {video ? (
                    <div>
                      <p className="text-white text-sm font-medium truncate">{video.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{(video.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-8 h-8 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-zinc-400 text-sm">Click to select a video</p>
                      <p className="text-zinc-600 text-xs mt-1">MP4 recommended · vertical format for Reels</p>
                    </div>
                  )}
                </div>
                <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />

                {status === 'posting' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                      <span>{progress < 50 ? 'Uploading...' : progress < 90 ? 'Processing...' : 'Publishing...'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-[#111] rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f09433, #dc2743, #bc1888)' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="mb-4 bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose} disabled={status === 'posting'}
                className="flex-1 py-2.5 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222] transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button onClick={handlePost} disabled={!canPost}
                className="flex-1 py-2.5 text-sm rounded-lg text-white font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
                {status === 'posting'
                  ? (postType === 'video' ? `Processing ${progress}%` : 'Posting...')
                  : 'Post to Instagram'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
