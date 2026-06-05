import { useState, useRef } from 'react'
import { uploadVideoToTikTok } from '../lib/tiktok'

interface Props {
  onClose: () => void
}

export default function TikTokUploadModal({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
    }
  }

  const handleUpload = async () => {
    if (!file || !title) return
    setStatus('uploading')
    setProgress(0)
    setError('')
    try {
      await uploadVideoToTikTok(file, title, setProgress)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={status !== 'uploading' ? onClose : undefined} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FE2C55]/15 border border-[#FE2C55]/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FE2C55">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.74a4.85 4.85 0 01-1-.05z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Upload to TikTok</h3>
            <p className="text-zinc-500 text-xs">Post a video to your TikTok account</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Video Posted!</p>
            <p className="text-zinc-500 text-sm mb-5">Your video has been submitted to TikTok</p>
            <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Video File</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  file ? 'border-[#FE2C55]/40 bg-[#FE2C55]/5' : 'border-[#2a2a2a] hover:border-zinc-500'
                }`}
              >
                {file ? (
                  <div>
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB · Vertical 9:16 recommended</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-8 h-8 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-zinc-400 text-sm">Click to select video</p>
                    <p className="text-zinc-600 text-xs mt-0.5">MP4 or MOV · Max 500MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/mov" onChange={handleFile} className="hidden" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Caption</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 150))}
                placeholder="What's this TikTok about?"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#FE2C55] transition-colors"
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{title.length}/150</p>
            </div>

            {status === 'uploading' && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>{progress < 86 ? 'Uploading...' : 'Processing...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[#111] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, background: '#FE2C55' }}
                  />
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-4 bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-5 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
              <p className="text-amber-400 text-xs">Sandbox mode active — videos only visible to sandbox users until TikTok approves the app.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={status === 'uploading'}
                className="flex-1 py-2.5 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222] transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || !title || status === 'uploading'}
                className="flex-1 py-2.5 text-sm rounded-lg text-white font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: '#FE2C55' }}
              >
                {status === 'uploading'
                  ? `${progress < 86 ? 'Uploading' : 'Processing'} ${progress}%`
                  : 'Post to TikTok'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
