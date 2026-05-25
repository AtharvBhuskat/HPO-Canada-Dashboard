import { useState } from 'react'
import type { Platform } from '../types'
import PlatformIcon from './PlatformIcon'

const PLATFORMS: Platform[] = ['linkedin', 'instagram', 'facebook', 'youtube']

interface Props {
  contentTitle: string
  onSchedule: (scheduled_at: string, platforms: Platform[]) => void
  onCancel: () => void
}

export default function ScheduleModal({ contentTitle, onSchedule, onCancel }: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])
  const [datetime, setDatetime] = useState('')

  const toggle = (p: Platform) =>
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const handleSubmit = () => {
    if (!datetime || selectedPlatforms.length === 0) return
    onSchedule(new Date(datetime).toISOString(), selectedPlatforms)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-1">Schedule Post</h3>
        <p className="text-sm text-zinc-500 mb-5 truncate">{contentTitle}</p>

        <div className="mb-5">
          <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Platforms</label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => toggle(p)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                  selectedPlatforms.includes(p)
                    ? 'border-red-600 bg-red-600/10 text-white'
                    : 'border-[#2a2a2a] text-zinc-400 hover:border-zinc-500'
                }`}
              >
                <PlatformIcon platform={p} size={16} />
                <span className="capitalize">{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Date & Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
            className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!datetime || selectedPlatforms.length === 0}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
