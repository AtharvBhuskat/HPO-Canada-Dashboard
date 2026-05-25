import { useState } from 'react'
import dayjs from 'dayjs'
import type { ContentItem } from '../types'
import StatusBadge from './StatusBadge'
import ScheduleModal from './ScheduleModal'
import { approveContent, rejectContent, scheduleContent } from '../api'
import type { Platform } from '../types'

const typeBadgeColors: Record<string, string> = {
  blog:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  email:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  video:    'bg-pink-500/20 text-pink-400 border-pink-500/30',
  research: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
}

interface Props {
  item: ContentItem
  onAction: () => void
}

export default function ContentCard({ item, onAction }: Props) {
  const [showSchedule, setShowSchedule] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | 'schedule' | null>(null)

  const handleApprove = async () => {
    setLoading('approve')
    try { await approveContent(item.id); onAction() } finally { setLoading(null) }
  }

  const handleReject = async () => {
    setLoading('reject')
    try { await rejectContent(item.id, rejectNote); onAction() } finally { setLoading(null); setShowReject(false) }
  }

  const handleSchedule = async (scheduled_at: string, platforms: Platform[]) => {
    setLoading('schedule')
    try { await scheduleContent(item.id, scheduled_at, platforms); onAction() } finally { setLoading(null); setShowSchedule(false) }
  }

  const isPending = item.status === 'pending'

  return (
    <>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#333] transition-colors flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${typeBadgeColors[item.type] ?? 'bg-zinc-800 text-zinc-400'}`}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
              <StatusBadge status={item.status} />
              <span className="text-xs text-zinc-500 ml-auto">{dayjs(item.created_at).format('MMM D, YYYY')}</span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug mb-1.5 truncate">{item.title}</h3>
            <p className="text-xs text-zinc-500 line-clamp-2">{item.preview}</p>
          </div>
        </div>

        {isPending && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#222]">
            <button
              onClick={handleApprove}
              disabled={!!loading}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors disabled:opacity-40"
            >
              {loading === 'approve' ? '...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowSchedule(true)}
              disabled={!!loading}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors disabled:opacity-40"
            >
              Schedule
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={!!loading}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors disabled:opacity-40"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {showSchedule && (
        <ScheduleModal
          contentTitle={item.title}
          onSchedule={handleSchedule}
          onCancel={() => setShowSchedule(false)}
        />
      )}

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowReject(false)} />
          <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Reject Content</h3>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-red-600 transition-colors mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReject(false)} className="px-4 py-2 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222] transition-colors">Cancel</button>
              <button onClick={handleReject} disabled={loading === 'reject'} className="px-4 py-2 text-sm rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40">
                {loading === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
