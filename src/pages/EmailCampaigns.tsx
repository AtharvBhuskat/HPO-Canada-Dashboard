import { useEffect, useState, useCallback } from 'react'
import { getContent, approveContent, rejectContent } from '../api'
import type { ContentItem } from '../types'
import dayjs from 'dayjs'
import StatusBadge from '../components/StatusBadge'
import { sendCampaignEmail } from '../lib/ses'

export default function EmailCampaigns() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showSend, setShowSend] = useState(false)

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
        <p className="text-zinc-500 text-sm">Review and send AI-generated email campaigns via Amazon SES</p>
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
                <div className="flex gap-2">
                  {selected.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setShowReject(true)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selected)}
                        disabled={actionLoading === selected.id + '-approve'}
                        className="px-3 py-1.5 text-xs rounded-lg bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors disabled:opacity-40"
                      >
                        {actionLoading === selected.id + '-approve' ? 'Approving...' : 'Approve'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowSend(true)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Email
                  </button>
                </div>
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

              {/* Reject modal */}
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

              {/* Send email modal */}
              {showSend && (
                <SendEmailModal
                  campaign={selected}
                  onClose={() => setShowSend(false)}
                  onSent={() => { setShowSend(false); load() }}
                />
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

// ── Send Email Modal ──────────────────────────────────────────────────────────

interface SendModalProps {
  campaign: ContentItem
  onClose: () => void
  onSent: () => void
}

function SendEmailModal({ campaign, onClose, onSent }: SendModalProps) {
  const [recipients, setRecipients] = useState('')
  const [subject, setSubject] = useState(campaign.title)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ sent_to: number } | null>(null)
  const [error, setError] = useState('')

  const handleSend = async () => {
    const to = recipients
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'))

    if (to.length === 0) {
      setError('Please enter at least one valid email address.')
      return
    }

    setStatus('sending')
    setError('')

    try {
      const res = await sendCampaignEmail({
        to,
        subject,
        html: campaign.body || `<p>${campaign.preview}</p>`,
      })
      setResult(res)
      setStatus('done')
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Failed to send')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={status !== 'sending' ? onClose : undefined} />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-600/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Send Email Campaign</h3>
            <p className="text-zinc-500 text-xs">Powered by Amazon SES · From: marketing@hpocanada.com</p>
          </div>
        </div>

        {status === 'done' && result ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">Campaign Sent!</p>
            <p className="text-zinc-400 text-sm mb-1">
              Delivered to <span className="text-white font-medium">{result.sent_to}</span> recipient{result.sent_to !== 1 ? 's' : ''}
            </p>
            <p className="text-zinc-600 text-xs mb-6">From: marketing@hpocanada.com via Amazon SES</p>
            <button
              onClick={onSent}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* From (read-only) */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">From</label>
              <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-zinc-400">
                HPO Canada &lt;marketing@hpocanada.com&gt;
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Recipients */}
            <div className="mb-5">
              <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Recipients</label>
              <textarea
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                placeholder={"Enter email addresses, one per line or comma-separated:\njohn@example.com\njane@company.com"}
                rows={4}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
              <p className="text-xs text-zinc-600 mt-1">
                {recipients.split(/[\n,]+/).filter(e => e.trim().includes('@')).length} recipient(s) entered
              </p>
            </div>

            {/* Error */}
            {(status === 'error' || error) && (
              <div className="mb-4 bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={status === 'sending'}
                className="flex-1 py-2.5 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222] transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={status === 'sending' || !subject || !recipients.trim()}
                className="flex-1 py-2.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Campaign
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
