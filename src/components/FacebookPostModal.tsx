import { useState, useRef } from 'react'
import {
  postToFacebookPage,
  postPhotoToFacebookPage,
  postMultiplePhotosToFacebookPage,
  postVideoToFacebookPage,
  postVideoToFacebookAndGetSourceUrl,
  getPostTarget,
} from '../lib/facebook'
import { isInstagramConnected, postVideoToInstagramFromUrl } from '../lib/instagram'

interface Props {
  onClose: () => void
}

type PostType = 'text' | 'photo' | 'multi' | 'video'

const TABS: { key: PostType; label: string; icon: string }[] = [
  { key: 'text',  label: 'Text',        icon: '✏️' },
  { key: 'photo', label: 'Photo',       icon: '🖼️' },
  { key: 'multi', label: 'Multi-Photo', icon: '🗃️' },
  { key: 'video', label: 'Video',       icon: '🎬' },
]

export default function FacebookPostModal({ onClose }: Props) {
  const [postType, setPostType] = useState<PostType>('text')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [multiImages, setMultiImages] = useState<File[]>([])
  const [multiPreviews, setMultiPreviews] = useState<string[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [progress, setProgress] = useState(0)
  const [alsoPostInstagram, setAlsoPostInstagram] = useState(false)
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'error'>('idle')
  const [postUrl, setPostUrl] = useState('')
  const [igPostUrl, setIgPostUrl] = useState('')
  const [error, setError] = useState('')

  const photoRef = useRef<HTMLInputElement>(null)
  const multiRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const target = getPostTarget()

  const handleSingleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImage(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleMultiImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 10)
    setMultiImages(files)
    setMultiPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeMultiImage = (i: number) => {
    setMultiImages(prev => prev.filter((_, idx) => idx !== i))
    setMultiPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setVideo(f)
    if (!videoTitle) setVideoTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
  }

  const handlePost = async () => {
    if (!message.trim() && postType !== 'video') return
    if (postType === 'video' && !video) return
    setStatus('posting')
    setProgress(0)
    setError('')
    try {
      let url = ''
      if (postType === 'text') {
        url = await postToFacebookPage(message, link || undefined)
      } else if (postType === 'photo' && image) {
        url = await postPhotoToFacebookPage(message, image)
      } else if (postType === 'multi' && multiImages.length > 0) {
        url = await postMultiplePhotosToFacebookPage(message, multiImages)
      } else if (postType === 'video' && video) {
        if (alsoPostInstagram && isInstagramConnected()) {
          const { postUrl: fbUrl, sourceUrl } = await postVideoToFacebookAndGetSourceUrl(
            videoTitle, message, video,
            (pct) => setProgress(Math.round(pct * 0.75))
          )
          url = fbUrl
          const igUrl = await postVideoToInstagramFromUrl(
            message, sourceUrl,
            (pct) => setProgress(75 + Math.round(pct * 0.25))
          )
          setIgPostUrl(igUrl)
        } else {
          url = await postVideoToFacebookPage(videoTitle, message, video, setProgress)
        }
      }
      setPostUrl(url)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Post failed')
    }
  }

  const canPost = !!target && status !== 'posting' && (
    (postType === 'text' && message.trim() !== '') ||
    (postType === 'photo' && !!image && message.trim() !== '') ||
    (postType === 'multi' && multiImages.length > 0 && message.trim() !== '') ||
    (postType === 'video' && !!video && videoTitle.trim() !== '')
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={status !== 'posting' ? onClose : undefined} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#1877F2]/20 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Post to Facebook</h3>
            <p className="text-zinc-500 text-xs">{target ? (target.isPage ? `Page: ${target.name}` : `Profile: ${target.name}`) : 'Not connected'}</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Posted to Facebook!</p>
            <p className="text-zinc-500 text-sm mb-5">Your post is now live on your page</p>
            <div className="flex flex-col gap-2 items-center">
              <a href={postUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm rounded-lg font-medium transition-colors w-full justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Facebook
              </a>
              {igPostUrl && (
                <a href={igPostUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-medium transition-colors w-full justify-center"
                  style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Instagram
                </a>
              )}
            </div>
            <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 mt-3">Close</button>
          </div>
        ) : (
          <>
            {/* Post type tabs */}
            <div className="grid grid-cols-4 gap-1 bg-[#111] rounded-xl p-1 border border-[#2a2a2a] mb-5">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setPostType(t.key)}
                  className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                    postType === t.key ? 'bg-[#1877F2] text-white' : 'text-zinc-400 hover:text-white'
                  }`}>
                  <div>{t.icon}</div>
                  <div>{t.label}</div>
                </button>
              ))}
            </div>

            {/* TEXT */}
            {postType === 'text' && (
              <>
                <div className="mb-4">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Message</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Write your post..." rows={5}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#1877F2] transition-colors" />
                  <p className="text-xs text-zinc-600 mt-1 text-right">{message.length} chars</p>
                </div>
                <div className="mb-5">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Link (Optional)</label>
                  <input type="url" value={link} onChange={e => setLink(e.target.value)}
                    placeholder="https://hpocanada.com/blog/..."
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#1877F2] transition-colors" />
                </div>
              </>
            )}

            {/* SINGLE PHOTO */}
            {postType === 'photo' && (
              <>
                <div className="mb-4">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Caption</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Write a caption..." rows={3}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#1877F2] transition-colors" />
                </div>
                <div className="mb-5">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Photo</label>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover rounded-xl border border-[#2a2a2a]" />
                      <button onClick={() => { setImage(null); setImagePreview(null) }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => photoRef.current?.click()}
                      className="border-2 border-dashed border-[#2a2a2a] hover:border-[#1877F2]/50 rounded-xl p-8 text-center cursor-pointer transition-colors">
                      <svg className="w-8 h-8 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-zinc-400 text-sm">Click to select a photo</p>
                      <p className="text-zinc-600 text-xs mt-1">JPG, PNG, GIF</p>
                    </div>
                  )}
                  <input ref={photoRef} type="file" accept="image/*" onChange={handleSingleImage} className="hidden" />
                </div>
              </>
            )}

            {/* MULTI PHOTO */}
            {postType === 'multi' && (
              <>
                <div className="mb-4">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Caption</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Write a caption for all photos..." rows={3}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#1877F2] transition-colors" />
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider">Photos (up to 10)</label>
                    <button onClick={() => multiRef.current?.click()}
                      className="text-xs text-[#1877F2] hover:text-[#166fe5] transition-colors">+ Add Photos</button>
                  </div>
                  {multiPreviews.length > 0 ? (
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {multiPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square">
                          <img src={src} alt="" className="w-full h-full object-cover rounded-lg border border-[#2a2a2a]" />
                          <button onClick={() => removeMultiImage(i)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div onClick={() => multiRef.current?.click()}
                      className="border-2 border-dashed border-[#2a2a2a] hover:border-[#1877F2]/50 rounded-xl p-8 text-center cursor-pointer transition-colors">
                      <svg className="w-8 h-8 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-zinc-400 text-sm">Click to select photos</p>
                      <p className="text-zinc-600 text-xs mt-1">Up to 10 images</p>
                    </div>
                  )}
                  <input ref={multiRef} type="file" accept="image/*" multiple onChange={handleMultiImages} className="hidden" />
                </div>
              </>
            )}

            {/* VIDEO */}
            {postType === 'video' && (
              <>
                <div className="mb-4">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Video Title</label>
                  <input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)}
                    placeholder="Video title"
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#1877F2] transition-colors" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Description</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your video..." rows={3}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#1877F2] transition-colors" />
                </div>
                <div className="mb-5">
                  <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Video File</label>
                  <div onClick={() => videoRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                      video ? 'border-[#1877F2]/50 bg-[#1877F2]/5' : 'border-[#2a2a2a] hover:border-[#1877F2]/50'
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
                        <p className="text-zinc-600 text-xs mt-1">MP4, MOV, AVI supported</p>
                      </div>
                    )}
                  </div>
                  <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                </div>
                {isInstagramConnected() && (
                  <div className="mb-4 flex items-center justify-between bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm text-white">Also post to Instagram</p>
                      <p className="text-xs text-zinc-500">Video will be posted as a Reel</p>
                    </div>
                    <button
                      onClick={() => setAlsoPostInstagram(p => !p)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${alsoPostInstagram ? 'bg-pink-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${alsoPostInstagram ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                )}

                {status === 'posting' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                      <span>{alsoPostInstagram && progress > 75 ? 'Posting to Instagram...' : 'Uploading video...'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-[#111] rounded-full h-2">
                      <div className="bg-[#1877F2] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </>
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
                className="flex-1 py-2.5 text-sm rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {status === 'posting'
                  ? (postType === 'video' ? `Uploading ${progress}%` : 'Posting...')
                  : 'Post to Facebook'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
