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

const typeIcons: Record<string, string> = {
  blog:     'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  email:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  video:    'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  research: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function cleanPreview(preview: string, type: string): string {
  if (type === 'email') return stripHtml(preview)
  return preview
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

interface Props {
  item: ContentItem
  onAction: () => void
}

export default function ContentCard({ item, onAction }: Props) {
  const [showPreview, setShowPreview] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | 'schedule' | null>(null)

  const handleApprove = async () => {
    setLoading('approve')
    try { await approveContent(item.id); onAction(); setShowPreview(false) } finally { setLoading(null) }
  }

  const handleReject = async () => {
    setLoading('reject')
    try { await rejectContent(item.id, rejectNote); onAction(); setShowReject(false); setShowPreview(false) } finally { setLoading(null); setShowReject(false) }
  }

  const handleSchedule = async (scheduled_at: string, platforms: Platform[]) => {
    setLoading('schedule')
    try { await scheduleContent(item.id, scheduled_at, platforms); onAction(); setShowSchedule(false); setShowPreview(false) } finally { setLoading(null); setShowSchedule(false) }
  }

  const isPending = item.status === 'pending'
  const cleanedPreview = cleanPreview(item.preview ?? '', item.type)

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
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{cleanedPreview}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-[#222]">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#111] text-zinc-400 border border-[#2a2a2a] hover:text-white hover:border-zinc-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>

          {isPending && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowPreview(false)} />
          <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">

            {/* Modal header */}
            <div className="flex items-start justify-between p-6 border-b border-[#2a2a2a] flex-shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${typeBadgeColors[item.type] ?? 'bg-zinc-800 text-zinc-400'}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h2 className="text-white font-semibold text-base leading-snug">{item.title}</h2>
                <p className="text-xs text-zinc-500 mt-1">{dayjs(item.created_at).format('MMMM D, YYYY')}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={typeIcons[item.type] ?? typeIcons.blog} />
                  </svg>
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Content Preview</p>
              </div>

              {item.type === 'email' ? (
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{cleanedPreview}</p>
                  <p className="text-xs text-zinc-600 mt-4 pt-3 border-t border-[#2a2a2a]">
                    Full email template available — approve to include in campaign
                  </p>
                </div>
              ) : (
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 space-y-3">
                  {cleanedPreview.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className={`leading-relaxed ${i === 0 ? 'text-white font-medium text-sm' : 'text-zinc-400 text-sm'}`}>
                      {line}
                    </p>
                  ))}
                  <p className="text-xs text-zinc-600 mt-2 pt-3 border-t border-[#2a2a2a]">
                    Showing preview — full content available after approval
                  </p>
                </div>
              )}

              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mt-4 bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Metadata</p>
                  <div className="space-y-1.5">
                    {Object.entries(item.metadata).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-xs">
                        <span className="text-zinc-500 capitalize w-28 flex-shrink-0">{k.replace(/_/g, ' ')}</span>
                        <span className="text-zinc-300 flex-1">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {isPending && (
              <div className="flex gap-2 p-5 border-t border-[#2a2a2a] flex-shrink-0">
                <button
                  onClick={handleApprove}
                  disabled={!!loading}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors disabled:opacity-40"
                >
                  {loading === 'approve' ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => { setShowPreview(false); setShowSchedule(true) }}
                  disabled={!!loading}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors disabled:opacity-40"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={!!loading}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
