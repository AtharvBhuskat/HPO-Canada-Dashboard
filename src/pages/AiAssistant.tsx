import { useState, useRef, useEffect } from 'react'

const API_URL = 'https://4mtxj04f6d.execute-api.us-east-1.amazonaws.com/default/chat'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Write a LinkedIn post about AI strategy for Canadian businesses',
  'Give me 5 Instagram caption ideas for this week',
  'How should we approach our TikTok content strategy?',
  'Summarize the key trends in AI marketing for 2026',
]

const CHAT_STORAGE_KEY = 'ai_assistant_messages'

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>(loadMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const history = next.slice(0, -1).map(m => ({
        role: m.role,
        content: [{ text: m.content }],
      }))

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'No response received.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const formatMessage = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-white mt-2 mb-0.5">{line.replace(/\*\*/g, '')}</p>
        }
        if (/^\d+\.\s/.test(line) || line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} className="ml-3 text-zinc-300">{line}</p>
        }
        if (line.trim() === '') return <div key={i} className="h-2" />
        return (
          <p key={i} className="text-zinc-300 leading-relaxed">
            {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>
                : part
            )}
          </p>
        )
      })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-5 border-b border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-semibold">AI Assistant</h1>
            <p className="text-zinc-500 text-xs">Powered by Amazon Nova Lite</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">HPO Canada AI Assistant</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-md">Ask anything about marketing strategy, content ideas, social media, leads, or campaigns. Powered by Amazon Nova Lite.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors text-sm text-zinc-400 hover:text-zinc-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-sm'
                : 'bg-[#1a1a1a] border border-[#2a2a2a] rounded-tl-sm'
            }`}>
              {msg.role === 'user'
                ? <p className="text-sm leading-relaxed">{msg.content}</p>
                : <div className="text-sm space-y-0.5">{formatMessage(msg.content)}</div>
              }
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-8 py-4 border-t border-[#1e1e1e] bg-[#0a0a0a]">
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); localStorage.removeItem(CHAT_STORAGE_KEY) }}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-3"
          >
            Clear conversation
          </button>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about marketing, content, strategy..."
            rows={1}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none transition-colors"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 hover:opacity-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-zinc-700 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
