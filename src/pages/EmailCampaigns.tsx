import { useEffect, useState, useCallback } from 'react'
import { getContent, approveContent, rejectContent } from '../api'
import type { ContentItem } from '../types'
import dayjs from 'dayjs'
import StatusBadge from '../components/StatusBadge'

export default function EmailCampaigns() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getContent({ type: 'email', status: 'all' })
      setItems(data.items)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (item: ContentItem) => {
    setActionLoading(item.id + '-approve')
    try { await approveContent(item.id); load(); setSelected(null) } finally { setActionLoading(null) }
  }

  const handleReject = async (item: ContentItem) => {
    setActionLoading(item.id + '-reject')
    try { await rejectContent(item.id, rejectNote); load(); setSelected(null); setShowReject(false) } finally { setActionLoading(null) }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Email Campaigns</h1>
        <p className="text-zinc-500 text-sm">Review and send AI-generated email campaigns via SES</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* List */}
        <div className="w-80 flex-shrink-0 overflow-y-auto space-y-2">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 h-24 animate-pulse" />
            ))
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">No email campaigns found</div>
          ) : (
            items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full text-left bg-[#1a1a1a] border rounded-xl p-4 transition-colors hover:border-[#333] ${
                  selected?.id === item.id ? 'border-red-600' : 'border-[#2a2a2a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-zinc-600">{dayjs(item.created_at).format('MMM D')}</span>
                </div>
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{item.preview}</p>
              </button>
            ))
          )}
        </div>

        {/* Preview panel */}
        <div className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">{selected.title}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{dayjs(selected.created_at).format('MMMM D, YYYY')}</p>
                </div>
                {selected.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowReject(true) }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selected)}
                      disabled={actionLoading === selected.id + '-approve'}
                      className="px-3 py-1.5 text-xs rounded-lg bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors disabled:opacity-40"
                    >
                      {actionLoading === selected.id + '-approve' ? 'Sending...' : 'Approve & Send'}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {selected.body ? (
                  <div className="bg-white rounded-lg p-4 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: selected.body }} />
                ) : (
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-[#111] rounded-lg p-6 border border-[#2a2a2a]">
                      <p className="text-zinc-300 text-sm leading-relaxed">{selected.preview}</p>
                    </div>
                  </div>
                )}
              </div>

              {showReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/70" onClick={() => setShowReject(false)} />
                  <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Reject Campaign</h3>
                    <textarea
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      placeholder="Reason for rejection (optional)"
                      rows={3}
                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-red-600 mb-4"
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setShowReject(false)} className="px-4 py-2 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222]">Cancel</button>
                      <button onClick={() => handleReject(selected)} disabled={actionLoading === selected.id + '-reject'} className="px-4 py-2 text-sm rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-40">
                        {actionLoading === selected.id + '-reject' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <p className="text-sm">Select a campaign to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
