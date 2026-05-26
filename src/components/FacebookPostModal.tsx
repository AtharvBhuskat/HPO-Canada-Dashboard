import { useState } from 'react'
import { postToFacebookPage, getFacebookPage } from '../lib/facebook'

interface Props {
  onClose: () => void
}

export default function FacebookPostModal({ onClose }: Props) {
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'error'>('idle')
  const [postUrl, setPostUrl] = useState('')
  const [error, setError] = useState('')
  const page = getFacebookPage()

  const handlePost = async () => {
    if (!message.trim()) return
    setStatus('posting')
    setError('')
    try {
      const url = await postToFacebookPage(message, link || undefined)
      setPostUrl(url)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Post failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={status !== 'posting' ? onClose : undefined} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#1877F2]/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Post to Facebook</h3>
            <p className="text-zinc-500 text-xs">
              {page ? `Posting to: ${page.name}` : 'No page found'}
            </p>
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
            {/* Message */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your Facebook post..."
                rows={5}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#1877F2] transition-colors"
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{message.length} characters</p>
            </div>

            {/* Optional link */}
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
                disabled={!message.trim() || status === 'posting' || !page}
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
