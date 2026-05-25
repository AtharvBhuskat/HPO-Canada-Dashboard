import { useEffect, useState, useCallback } from 'react'
import { getContent } from '../api'
import type { ContentItem, ContentType, ContentStatus } from '../types'
import ContentCard from '../components/ContentCard'

type TabFilter = 'all' | ContentType
type StatusFilter = 'all' | ContentStatus

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'blog', label: 'Blog' },
  { key: 'email', label: 'Email' },
  { key: 'video', label: 'Video' },
  { key: 'research', label: 'Research' },
]

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All Statuses' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'posted', label: 'Posted' },
]

export default function ContentQueue() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeTab, setTypeTab] = useState<TabFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getContent({
        type: typeTab !== 'all' ? typeTab : undefined,
        status: statusFilter !== 'all' ? statusFilter : 'all',
      })
      setItems(data.items)
    } finally {
      setLoading(false)
    }
  }, [typeTab, statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Content Queue</h1>
        <p className="text-zinc-500 text-sm">Review and manage AI-generated content</p>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-1 mb-4 bg-[#111] rounded-xl p-1 w-fit border border-[#2a2a2a]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTypeTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeTab === t.key ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === f.key
                ? 'border-red-600 text-red-400 bg-red-600/10'
                : 'border-[#2a2a2a] text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium">No content found</p>
          <p className="text-zinc-600 text-sm mt-1">Try changing the filters above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <ContentCard key={item.id} item={item} onAction={load} />
          ))}
        </div>
      )}
    </div>
  )
}
