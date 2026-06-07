import { useState } from 'react'
import { postToLinkedIn, getLinkedInTokens } from '../lib/linkedin'

interface Props {
  onClose: () => void
}

export default function LinkedInPostModal({ onClose }: Props) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'error'>('idle')
  const [postUrl, setPostUrl] = useState('')
  const [error, setError] = useState('')
  const tokens = getLinkedInTokens()

  const handlePost = async () => {
    if (!text.trim()) return
    setStatus('posting')
    setError('')
    try {
      const url = await postToLinkedIn(text)
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0A66C2' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Post to LinkedIn</h3>
            <p className="text-zinc-500 text-xs">
              {tokens?.person_name ? `As ${tokens.person_name}` : 'Post to your LinkedIn feed'}
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
            <p className="text-white font-semibold mb-1">Posted to LinkedIn!</p>
            <p className="text-zinc-500 text-sm mb-5">Your post is now live</p>
            {postUrl && (
              <a
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-medium transition-opacity hover:opacity-80 mb-4"
                style={{ background: '#0A66C2' }}
              >
                View on LinkedIn
              </a>
            )}
            <br />
            <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 mt-3">Close</button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Post Content</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, 3000))}
                placeholder="What do you want to share on LinkedIn?"
                rows={6}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#0A66C2] transition-colors"
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{text.length}/3000</p>
            </div>

            {status === 'error' && (
              <div className="mb-4 bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

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
                disabled={!text.trim() || status === 'posting'}
                className="flex-1 py-2.5 text-sm rounded-lg text-white font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: '#0A66C2' }}
              >
                {status === 'posting' ? 'Posting...' : 'Post to LinkedIn'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
