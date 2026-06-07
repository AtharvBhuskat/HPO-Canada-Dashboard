import { useState, useRef } from 'react'
import { postToLinkedIn, postImageToLinkedIn, postVideoToLinkedIn, getLinkedInTokens } from '../lib/linkedin'

interface Props {
  onClose: () => void
}

type Tab = 'text' | 'image' | 'video'

export default function LinkedInPostModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'error'>('idle')
  const [postUrl, setPostUrl] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const tokens = getLinkedInTokens()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handlePost = async () => {
    if (!text.trim()) return
    setStatus('posting')
    setProgress(0)
    setError('')
    try {
      let url = ''
      if (tab === 'text') {
        url = await postToLinkedIn(text)
      } else if (tab === 'image') {
        if (!file) throw new Error('Please select an image')
        url = await postImageToLinkedIn(text, file, setProgress)
      } else {
        if (!file) throw new Error('Please select a video')
        url = await postVideoToLinkedIn(text, file, setProgress)
      }
      setPostUrl(url)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Post failed')
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'text', label: 'Text' },
    { id: 'image', label: 'Image' },
    { id: 'video', label: 'Video' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={status !== 'posting' ? onClose : undefined} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0A66C2' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Post to LinkedIn</h3>
            <p className="text-zinc-500 text-xs">{tokens?.person_name ?? 'Your LinkedIn account'}</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Posted to LinkedIn!</p>
            <p className="text-zinc-500 text-sm mb-5">Your post is now live</p>
            {postUrl && (
              <a href={postUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-medium hover:opacity-80 mb-4"
                style={{ background: '#0A66C2' }}>
                View on LinkedIn
              </a>
            )}
            <br />
            <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 mt-3">Close</button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-[#111] rounded-lg p-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setFile(null); setError('') }}
                  className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    tab === t.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={tab === t.id ? { background: '#0A66C2' } : undefined}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Caption / Text */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
                {tab === 'text' ? 'Post Content' : 'Caption'}
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, 3000))}
                placeholder={tab === 'text' ? 'What do you want to share on LinkedIn?' : 'Add a caption...'}
                rows={tab === 'text' ? 6 : 3}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#0A66C2] transition-colors"
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{text.length}/3000</p>
            </div>

            {/* File picker for image/video */}
            {(tab === 'image' || tab === 'video') && (
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">
                  {tab === 'image' ? 'Image' : 'Video'}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    file ? 'border-[#0A66C2]/50 bg-[#0A66C2]/5' : 'border-[#2a2a2a] hover:border-zinc-500'
                  }`}
                >
                  {file ? (
                    <div>
                      <p className="text-white text-sm font-medium truncate">{file.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-7 h-7 text-zinc-600 mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-zinc-400 text-sm">Click to select {tab === 'image' ? 'image' : 'video'}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">
                        {tab === 'image' ? 'JPG, PNG, GIF' : 'MP4, MOV'}
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept={tab === 'image' ? 'image/jpeg,image/png,image/gif' : 'video/mp4,video/quicktime'}
                    onChange={handleFile}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Progress bar */}
            {status === 'posting' && tab !== 'text' && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[#111] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: '#0A66C2' }} />
                </div>
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
                disabled={!text.trim() || status === 'posting' || ((tab === 'image' || tab === 'video') && !file)}
                className="flex-1 py-2.5 text-sm rounded-lg text-white font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: '#0A66C2' }}
              >
                {status === 'posting' ? 'Posting...' : `Post ${tab === 'text' ? '' : tab.charAt(0).toUpperCase() + tab.slice(1)} to LinkedIn`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
