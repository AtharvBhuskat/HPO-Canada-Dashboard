import { useState, useRef } from 'react'
import { postToFacebookPage, postPhotoToFacebookPage, getFacebookPage } from '../lib/facebook'

interface Props {
  onClose: () => void
}

type PostType = 'text' | 'photo'

export default function FacebookPostModal({ onClose }: Props) {
  const [postType, setPostType] = useState<PostType>('text')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'error'>('idle')
  const [postUrl, setPostUrl] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const page = getFacebookPage()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handlePost = async () => {
    if (!message.trim()) return
    setStatus('posting')
    setError('')
    try {
      let url = ''
      if (postType === 'photo' && image) {
        url = await postPhotoToFacebookPage(message, image)
      } else {
        url = await postToFacebookPage(message, link || undefined)
      }
      setPostUrl(url)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Post failed')
    }
  }

  const canPost = message.trim() && !!page && status !== 'posting' &&
    (postType === 'text' || (postType === 'photo' && !!image))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={status !== 'posting' ? onClose : undefined} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#1877F2]/20 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Post to Facebook</h3>
            <p className="text-zinc-500 text-xs">{page ? `Page: ${page.name}` : 'No page found'}</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Posted to Facebook!</p>
            <p className="text-zinc-500 text-sm mb-4">Your post is now live on your page</p>
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm rounded-lg font-medium transition-colors mb-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Facebook
            </a>
            <br />
            <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
          </div>
        ) : (
          <>
            {/* Post type tabs */}
            <div className="flex gap-1 bg-[#111] rounded-xl p-1 border border-[#2a2a2a] mb-5">
              {([
                { key: 'text', label: 'Text / Link', icon: '✏️' },
                { key: 'photo', label: 'Photo', icon: '🖼️' },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setPostType(t.key)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    postType === t.key ? 'bg-[#1877F2] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                {postType === 'photo' ? 'Caption' : 'Message'}
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={postType === 'photo' ? 'Write a caption for your photo...' : 'Write your Facebook post...'}
                rows={4}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#1877F2] transition-colors"
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{message.length} characters</p>
            </div>

            {/* Text post: optional link */}
            {postType === 'text' && (
              <div className="mb-5">
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Link (Optional)</label>
                <input
                  type="url"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="https://hpocanada.com/blog/..."
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#1877F2] transition-colors"
                />
              </div>
            )}

            {/* Photo post: image picker */}
            {postType === 'photo' && (
              <div className="mb-5">
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Image</label>
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border border-[#2a2a2a]"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="mt-2 px-1">
                      <p className="text-xs text-zinc-500 truncate">{image?.name}</p>
                      <p className="text-xs text-zinc-600">{image ? (image.size / 1024 / 1024).toFixed(1) + ' MB' : ''}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-[#2a2a2a] hover:border-[#1877F2]/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
                  >
                    <svg className="w-10 h-10 text-zinc-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-zinc-400 text-sm">Click to select an image</p>
                    <p className="text-zinc-600 text-xs mt-1">JPG, PNG, GIF supported</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
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
              <button
                onClick={onClose}
                disabled={status === 'posting'}
                className="flex-1 py-2.5 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222] transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!canPost}
                className="flex-1 py-2.5 text-sm rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'posting' ? 'Posting...' : 'Post to Facebook'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
