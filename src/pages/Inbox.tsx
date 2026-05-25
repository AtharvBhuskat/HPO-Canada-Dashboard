import { useEffect, useState, useCallback, useRef } from 'react'
import { getThreads, getThread, replyToThread } from '../api'
import type { Thread, Message } from '../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default function Inbox() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [selected, setSelected] = useState<Thread | null>(null)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true)
    setError('')
    try {
      const data = await getThreads()
      setThreads(data.items ?? [])
    } catch {
      setError('Could not load inbox. No emails received yet or API unavailable.')
      setThreads([])
    } finally {
      setLoadingThreads(false)
    }
  }, [])

  useEffect(() => { loadThreads() }, [loadThreads])

  const openThread = async (thread: Thread) => {
    setSelected(thread)
    setLoadingMessages(true)
    try {
      const full = await getThread(thread.id)
      setSelected(full)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      // keep showing the thread header even if messages fail
    } finally {
      setLoadingMessages(false)
    }
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
    } catch {
      // reply failed silently — could add toast here later
    } finally {
      setSending(false)
    }
  }

  const filteredThreads = threads.filter(t =>
    t.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
        <p className="text-zinc-500 text-sm">Email threads from marketing@hpocanada.com</p>
      </div>

      <div className="flex gap-4 min-h-0 flex-1">
        {/* Thread list */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="p-3 border-b border-[#2a2a2a]">
            <input
              type="text"
              placeholder="Search threads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#111] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-zinc-500 text-xs">{error}</p>
                <button
                  onClick={loadThreads}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-zinc-600 text-sm">No threads yet</p>
                <p className="text-zinc-700 text-xs mt-1">Emails will appear here when received</p>
              </div>
            ) : (
              filteredThreads.map(t => (
                <button
                  key={t.id}
                  onClick={() => openThread(t)}
                  className={`w-full text-left px-4 py-3.5 border-b border-[#222] hover:bg-[#111] transition-colors ${
                    selected?.id === t.id ? 'bg-red-600/10 border-l-2 border-l-red-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-medium truncate ${t.unread ? 'text-white' : 'text-zinc-300'}`}>
                      {t.contact_name}
                    </span>
                    <span className="text-xs text-zinc-600 flex-shrink-0 ml-2">
                      {t.last_reply_at ? dayjs(t.last_reply_at).fromNow() : ''}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${t.unread ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.subject}</p>
                  {t.unread && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-1" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message panel */}
        <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden min-w-0">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-[#2a2a2a] flex-shrink-0">
                <h2 className="text-base font-semibold text-white">{selected.subject}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {selected.contact_name} &lt;{selected.contact_email}&gt;
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                        <div className="h-16 w-64 bg-[#111] rounded-xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (selected.messages ?? []).length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center pt-8">No messages in this thread yet</p>
                ) : (
                  (selected.messages ?? []).map((msg: Message) => (
                    <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                        msg.direction === 'outbound'
                          ? 'bg-red-600/20 border border-red-600/30'
                          : 'bg-[#111] border border-[#2a2a2a]'
                      }`}>
                        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className="text-xs text-zinc-600 mt-1.5">
                          {msg.sent_at ? dayjs(msg.sent_at).format('MMM D, h:mm A') : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-[#2a2a2a] flex-shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply() }}
                    placeholder="Write a reply... (Ctrl+Enter to send)"
                    rows={3}
                    className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-red-600 transition-colors placeholder-zinc-600"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" strokeWidth={1.5} strokeLinecap="round" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
                <p className="text-sm">Select a thread to read messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
