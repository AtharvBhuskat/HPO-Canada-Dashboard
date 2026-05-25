import { useState, useRef } from 'react'
import { uploadVideo } from '../lib/youtube'

interface Props {
  onClose: () => void
}

export default function YouTubeUploadModal({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [videoUrl, setVideoUrl] = useState('')
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
      const url = await uploadVideo(file, title, description, setProgress)
      setVideoUrl(url)
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Upload to YouTube</h3>
            <p className="text-zinc-500 text-xs">Post a video to your channel</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Video Uploaded!</p>
            <p className="text-zinc-500 text-sm mb-4">Your video is now live on YouTube</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors mb-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on YouTube
            </a>
            <br />
            <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
          </div>
        ) : (
          <>
            {/* File picker */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Video File</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  file ? 'border-red-600/50 bg-red-600/5' : 'border-[#2a2a2a] hover:border-zinc-500'
                }`}
              >
                {file ? (
                  <div>
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-8 h-8 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-zinc-400 text-sm">Click to select video</p>
                    <p className="text-zinc-600 text-xs mt-0.5">MP4, MOV, AVI supported</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Video title"
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Video description (optional)"
                rows={3}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Progress bar */}
            {status === 'uploading' && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[#111] rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
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
                disabled={status === 'uploading'}
                className="flex-1 py-2.5 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222] transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || !title || status === 'uploading'}
                className="flex-1 py-2.5 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'uploading' ? `Uploading ${progress}%` : 'Upload to YouTube'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
