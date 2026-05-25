import { useEffect, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { getScheduledPosts, cancelScheduledPost } from '../api'
import type { ScheduledPost } from '../types'
import PlatformIcon from '../components/PlatformIcon'
import StatusBadge from '../components/StatusBadge'
import ConfirmModal from '../components/ConfirmModal'

type View = 'month' | 'week' | 'day'

export default function Schedule() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('month')
  const [current, setCurrent] = useState(dayjs())
  const [selected, setSelected] = useState<ScheduledPost | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ScheduledPost | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getScheduledPosts('all')
      setPosts(data.items)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCancel = async () => {
    if (!cancelTarget) return
    await cancelScheduledPost(cancelTarget.id)
    setCancelTarget(null)
    setSelected(null)
    load()
  }

  const postsForDay = (date: dayjs.Dayjs) =>
    posts.filter(p => dayjs(p.scheduled_at).isSame(date, 'day'))

  // --- Month view ---
  const renderMonth = () => {
    const start = current.startOf('month').startOf('week')
    const end = current.endOf('month').endOf('week')
    const days: dayjs.Dayjs[] = []
    let d = start
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      days.push(d)
      d = d.add(1, 'day')
    }
    return (
      <div>
        <div className="grid grid-cols-7 mb-1">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-zinc-500 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-[#2a2a2a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          {days.map(day => {
            const dayPosts = postsForDay(day)
            const isToday = day.isSame(dayjs(), 'day')
            const isCurrentMonth = day.month() === current.month()
            return (
              <div key={day.toString()} className={`min-h-[100px] p-2 bg-[#1a1a1a] ${!isCurrentMonth ? 'opacity-40' : ''}`}>
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-red-600 text-white' : 'text-zinc-400'
                }`}>
                  {day.date()}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="w-full text-left text-xs px-1.5 py-1 rounded bg-[#111] border border-[#2a2a2a] hover:border-red-600/50 flex items-center gap-1.5 truncate"
                    >
                      <PlatformIcon platform={p.platform} size={10} />
                      <span className="truncate text-zinc-300">{p.title}</span>
                    </button>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="text-xs text-zinc-600 pl-1">+{dayPosts.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // --- Week view ---
  const renderWeek = () => {
    const weekStart = current.startOf('week')
    const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayPosts = postsForDay(day)
          const isToday = day.isSame(dayjs(), 'day')
          return (
            <div key={day.toString()} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
              <div className="text-center mb-3">
                <div className="text-xs text-zinc-500">{day.format('ddd')}</div>
                <div className={`text-lg font-semibold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full mx-auto ${
                  isToday ? 'bg-red-600 text-white' : 'text-white'
                }`}>
                  {day.date()}
                </div>
              </div>
              <div className="space-y-2">
                {dayPosts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="w-full text-left p-2 rounded-lg bg-[#111] border border-[#2a2a2a] hover:border-red-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <PlatformIcon platform={p.platform} size={12} />
                      <span className="text-xs text-zinc-500">{dayjs(p.scheduled_at).format('h:mm A')}</span>
                    </div>
                    <p className="text-xs text-zinc-300 truncate">{p.title}</p>
                  </button>
                ))}
                {dayPosts.length === 0 && <p className="text-xs text-zinc-700 text-center py-2">—</p>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // --- Day view ---
  const renderDay = () => {
    const dayPosts = postsForDay(current).sort((a, b) =>
      dayjs(a.scheduled_at).diff(dayjs(b.scheduled_at))
    )
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a2a]">
          <p className="text-white font-semibold">{current.format('dddd, MMMM D, YYYY')}</p>
        </div>
        {dayPosts.length === 0 ? (
          <div className="py-16 text-center text-zinc-600">No posts scheduled for this day</div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {dayPosts.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full text-left px-6 py-4 hover:bg-[#111] transition-colors flex items-center gap-4"
              >
                <span className="text-sm text-zinc-500 w-20 flex-shrink-0">{dayjs(p.scheduled_at).format('h:mm A')}</span>
                <PlatformIcon platform={p.platform} size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.title}</p>
                </div>
                <StatusBadge status={p.status as 'pending'} />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const navigate = (dir: -1 | 1) => {
    const unit = view === 'month' ? 'month' : view === 'week' ? 'week' : 'day'
    setCurrent(c => c.add(dir, unit))
  }

  const headerLabel = () => {
    if (view === 'month') return current.format('MMMM YYYY')
    if (view === 'week') {
      const s = current.startOf('week')
      const e = current.endOf('week')
      return `${s.format('MMM D')} – ${e.format('MMM D, YYYY')}`
    }
    return current.format('dddd, MMMM D, YYYY')
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Schedule</h1>
          <p className="text-zinc-500 text-sm">All scheduled social posts</p>
        </div>
        <div className="flex items-center gap-1 bg-[#111] rounded-xl p-1 border border-[#2a2a2a]">
          {(['month','week','day'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${view === v ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-[#2a2a2a] text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => setCurrent(dayjs())} className="px-3 py-1.5 text-xs rounded-lg border border-[#2a2a2a] text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">Today</button>
        <button onClick={() => navigate(1)} className="p-2 rounded-lg border border-[#2a2a2a] text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <h2 className="text-white font-semibold">{headerLabel()}</h2>
        {loading && <span className="text-xs text-zinc-500 ml-auto">Loading...</span>}
      </div>

      {view === 'month' && renderMonth()}
      {view === 'week' && renderWeek()}
      {view === 'day' && renderDay()}

      {/* Post detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <PlatformIcon platform={selected.platform} size={24} showLabel />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{selected.title}</h3>
            <p className="text-sm text-zinc-500 mb-1">{dayjs(selected.scheduled_at).format('MMMM D, YYYY [at] h:mm A')}</p>
            <div className="mb-5"><StatusBadge status={selected.status as 'pending'} /></div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm rounded-lg border border-[#2a2a2a] text-zinc-300 hover:bg-[#222]">Close</button>
              {selected.status === 'pending' && (
                <button onClick={() => setCancelTarget(selected)} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium">Cancel Post</button>
              )}
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancel Scheduled Post"
          message={`Cancel "${cancelTarget.title}" scheduled for ${dayjs(cancelTarget.scheduled_at).format('MMM D [at] h:mm A')}?`}
          confirmLabel="Cancel Post"
          danger
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  )
}
