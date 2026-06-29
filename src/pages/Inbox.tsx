import { useEffect, useState, useCallback, useRef } from 'react'
import { getThreads, getThread, replyToThread, markThreadRead, sendEmail, getSentEmails } from '../api'
import type { Thread, Message, SentEmail } from '../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type Folder = 'inbox' | 'sent' | 'compose'

export default function Inbox() {
  const [folder, setFolder] = useState<Folder>('inbox')
  const [threads, setThreads] = useState<Thread[]>([])
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])
  const [selected, setSelected] = useState<Thread | null>(null)
  const [selectedSent, setSelectedSent] = useState<SentEmail | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' })
  const bottomRef = useRef<HTMLDivElement>(null)

  const unreadCount = threads.filter(t => t.unread).length

  const loadInbox = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await getThreads()
      setThreads(data.items ?? [])
    } catch { setThreads([]) }
    finally { setLoadingList(false) }
  }, [])

  const loadSent = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await getSentEmails()
      setSentEmails(data.items ?? [])
    } catch { setSentEmails([]) }
    finally { setLoadingList(false) }
  }, [])

  useEffect(() => {
    if (folder === 'inbox') loadInbox()
    else if (folder === 'sent') loadSent()
  }, [folder, loadInbox, loadSent])

  const openThread = async (thread: Thread) => {
    setSelected(thread)
    setSelectedSent(null)
    setReplyText('')
    setLoadingMessages(true)
    try {
      const full = await getThread(thread.id)
      setSelected(full)
      if (thread.unread) {
        markThreadRead(thread.id).catch(() => {})
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: false } : t))
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { /* keep showing thread header */ }
    finally { setLoadingMessages(false) }
  }

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return
    setSending(true)
    try {
      await replyToThread(selected.id, replyText)
      setReplyText('')
      const updated = await getThread(selected.id)
      setSelected(updated)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { /* silent */ }
    finally { setSending(false) }
  }

  const handleSend = async () => {
    if (!compose.to.trim() || !compose.subject.trim() || !compose.body.trim()) return
    setSending(true)
    try {
      await sendEmail(compose)
      setCompose({ to: '', subject: '', body: '' })
      setFolder('sent')
      await loadSent()
    } catch { /* silent */ }
    finally { setSending(false) }
  }

  const filteredThreads = threads.filter(t =>
    t.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.contact_email?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSent = sentEmails.filter(e =>
    e.to_email?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 left-60 bg-[#0a0a0a] flex overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────────────────────── */}
      <div className="w-48 flex-shrink-0 flex flex-col border-r border-[#1e1e1e] bg-[#111111] pt-6 pb-4">
        <div className="px-4 mb-6">
          <h1 className="text-white font-bold text-lg">Mail</h1>
          <p className="text-zinc-600 text-xs mt-0.5">marketing@hpocanada.com</p>
        </div>

        <button
          onClick={() => { setFolder('compose'); setSelected(null); setSelectedSent(null) }}
          className="mx-4 mb-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Compose
        </button>

        <nav className="flex-1 px-2 space-y-0.5">
          <FolderItem
            icon={<InboxIcon />}
            label="Inbox"
            badge={unreadCount}
            active={folder === 'inbox'}
            onClick={() => { setFolder('inbox'); setSelectedSent(null) }}
          />
          <FolderItem
            icon={<SentIcon />}
            label="Sent"
            active={folder === 'sent'}
            onClick={() => { setFolder('sent'); setSelected(null) }}
          />
        </nav>
      </div>

      {/* ── Email list ───────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-[#1e1e1e] bg-[#0f0f0f]">
        <div className="p-3 border-b border-[#1e1e1e]">
          <input
            type="text"
            placeholder={folder === 'sent' ? 'Search sent...' : 'Search inbox...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {folder === 'compose' ? (
            <div className="p-6 text-center text-zinc-600 text-sm pt-20">
              <ComposeIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              New message
            </div>
          ) : loadingList ? (
            <div className="p-3 space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-[#1a1a1a] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : folder === 'inbox' ? (
            filteredThreads.length === 0 ? (
              <EmptyState label="No emails in inbox" sub="Received emails will appear here" />
            ) : filteredThreads.map(t => (
              <button
                key={t.id}
                onClick={() => openThread(t)}
                className={`w-full text-left px-4 py-3.5 border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors ${
                  selected?.id === t.id ? 'bg-red-600/10 border-l-2 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm truncate ${t.unread ? 'font-semibold text-white' : 'text-zinc-300'}`}>
                    {t.contact_name && t.contact_name !== t.contact_email ? t.contact_name : (t.contact_email ?? '').split('@')[1] || t.contact_email || 'Unknown'}
                  </span>
                  <span className="text-[11px] text-zinc-600 flex-shrink-0 ml-2">
                    {t.last_reply_at ? dayjs(t.last_reply_at).fromNow() : ''}
                  </span>
                </div>
                <p className={`text-xs truncate mb-0.5 ${t.unread ? 'text-zinc-300' : 'text-zinc-500'}`}>{t.subject}</p>
                <div className="flex items-center gap-1.5">
                  {t.unread && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                </div>
              </button>
            ))
          ) : (
            filteredSent.length === 0 ? (
              <EmptyState label="No sent emails" sub="Emails you send will appear here" />
            ) : filteredSent.map(e => (
              <button
                key={e.id}
                onClick={() => { setSelectedSent(e); setSelected(null) }}
                className={`w-full text-left px-4 py-3.5 border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors ${
                  selectedSent?.id === e.id ? 'bg-red-600/10 border-l-2 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm text-zinc-300 truncate">{e.to_email}</span>
                  <span className="text-[11px] text-zinc-600 flex-shrink-0 ml-2">
                    {e.sent_at ? dayjs(e.sent_at).fromNow() : ''}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate">{e.subject}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Detail / Compose panel ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">

        {/* Compose */}
        {folder === 'compose' && (
          <div className="flex-1 flex flex-col p-6 max-w-3xl w-full mx-auto">
            <h2 className="text-white font-semibold text-lg mb-6">New Message</h2>
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3 border-b border-[#1e1e1e] pb-3">
                <span className="text-zinc-500 text-sm w-12">To</span>
                <input
                  type="email"
                  value={compose.to}
                  onChange={e => setCompose(c => ({ ...c, to: e.target.value }))}
                  placeholder="recipient@example.com"
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-zinc-600"
                />
              </div>
              <div className="flex items-center gap-3 border-b border-[#1e1e1e] pb-3">
                <span className="text-zinc-500 text-sm w-12">Subject</span>
                <input
                  type="text"
                  value={compose.subject}
                  onChange={e => setCompose(c => ({ ...c, subject: e.target.value }))}
                  placeholder="Email subject"
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-zinc-600"
                />
              </div>
              <textarea
                value={compose.body}
                onChange={e => setCompose(c => ({ ...c, body: e.target.value }))}
                placeholder="Write your message..."
                className="flex-1 bg-transparent text-zinc-200 text-sm resize-none focus:outline-none placeholder-zinc-600 leading-relaxed"
              />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[#1e1e1e] mt-4">
              <button
                onClick={handleSend}
                disabled={sending || !compose.to || !compose.subject || !compose.body}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? 'Sending...' : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </>
                )}
              </button>
              <span className="text-zinc-600 text-xs">From: marketing@hpocanada.com</span>
            </div>
          </div>
        )}

        {/* Sent email detail */}
        {selectedSent && !selected && (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-white font-semibold text-xl mb-3">{selectedSent.subject}</h2>
              <div className="flex flex-col gap-1.5 text-sm text-zinc-500">
                <div className="flex gap-2">
                  <span className="text-zinc-600 w-10">To</span>
                  <span className="text-zinc-300">{selectedSent.to_email}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-600 w-10">From</span>
                  <span className="text-zinc-300">marketing@hpocanada.com</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-600 w-10">Date</span>
                  <span className="text-zinc-400">{dayjs(selectedSent.sent_at).format('MMM D, YYYY h:mm A')}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-[#1e1e1e] pt-6">
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedSent.body}</p>
            </div>
          </div>
        )}

        {/* Inbox thread detail */}
        {selected && (
          <>
            <div className="px-6 py-4 border-b border-[#1e1e1e] flex-shrink-0">
              <h2 className="text-white font-semibold text-lg leading-snug">{selected.subject}</h2>
              <p className="text-xs text-zinc-500 mt-1">From: <span className="text-zinc-300">{selected.contact_email}</span></p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                      <div className="h-20 w-72 bg-[#1a1a1a] rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (selected.messages ?? []).length === 0 ? (
                <p className="text-zinc-600 text-sm text-center pt-8">No messages yet</p>
              ) : (
                (selected.messages ?? []).map((msg: Message, i: number) => {
                  const isHtml = msg.is_html || /<[a-z][\s\S]*>/i.test(msg.body)
                  return (
                    <div key={msg.id || i} className={msg.direction === 'outbound' ? 'flex justify-end' : ''}>
                      {msg.direction === 'outbound' ? (
                        <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-red-600/20 border border-red-600/30">
                          <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          <p className="text-[11px] text-zinc-600 mt-1.5">
                            {msg.sent_at ? dayjs(msg.sent_at).format('MMM D, h:mm A') : ''} · You
                          </p>
                        </div>
                      ) : (
                        <div className="w-full rounded-xl border border-[#2a2a2a] overflow-hidden">
                          {isHtml ? (
                            <iframe
                              srcDoc={msg.body}
                              sandbox="allow-same-origin"
                              className="w-full bg-white"
                              style={{ minHeight: '300px', height: 'auto', border: 'none' }}
                              onLoad={e => {
                                const iframe = e.currentTarget
                                const h = iframe.contentDocument?.documentElement?.scrollHeight
                                if (h) iframe.style.height = h + 'px'
                              }}
                            />
                          ) : (
                            <div className="px-4 py-3 bg-[#1a1a1a]">
                              <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                            </div>
                          )}
                          <div className="px-4 py-2 bg-[#111] border-t border-[#2a2a2a]">
                            <p className="text-[11px] text-zinc-600">
                              {msg.sent_at ? dayjs(msg.sent_at).format('MMM D, h:mm A') : ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t border-[#1e1e1e] flex-shrink-0 bg-[#0a0a0a]">
              <div className="flex gap-2 items-end max-w-3xl mx-auto">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply() }}
                  placeholder="Reply... (Ctrl+Enter to send)"
                  rows={3}
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-red-600 transition-colors placeholder-zinc-600"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || sending}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-40 flex-shrink-0 flex items-center gap-1.5"
                >
                  {sending ? '...' : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Nothing selected */}
        {!selected && !selectedSent && folder !== 'compose' && (
          <div className="flex-1 flex items-center justify-center text-zinc-700">
            <div className="text-center">
              <InboxIcon className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FolderItem({
  icon, label, badge, active, onClick,
}: {
  icon: React.ReactNode
  label: string
  badge?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-red-600/15 text-red-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
      }`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {!!badge && (
        <span className="bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge}
        </span>
      )}
    </button>
  )
}

function EmptyState({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="py-16 text-center px-4">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className="text-zinc-700 text-xs mt-1">{sub}</p>
    </div>
  )
}

function InboxIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  )
}

function SentIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

function ComposeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}
