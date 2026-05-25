import { useEffect, useState, useCallback } from 'react'
import { getLeads, createLead, updateLead, deleteLead } from '../api'
import type { Lead, LeadStatus } from '../types'
import StatusBadge from '../components/StatusBadge'
import ConfirmModal from '../components/ConfirmModal'
import dayjs from 'dayjs'

const STATUSES: LeadStatus[] = ['cold', 'warm', 'active']

const emptyForm = { name: '', email: '', company: '', status: 'cold' as LeadStatus }

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState<Partial<Lead>>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLeads()
      setLeads(data.items)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    try { await createLead(form); setShowAdd(false); setForm(emptyForm); load() } finally { setSaving(false) }
  }

  const handleEdit = async (id: string) => {
    setSaving(true)
    try { await updateLead(id, editForm); setEditId(null); setEditForm({}); load() } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteLead(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Leads</h1>
          <p className="text-zinc-500 text-sm">Manage contacts and track outreach</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 w-64 transition-colors"
        />
        <div className="flex items-center gap-1 bg-[#111] rounded-xl p-1 border border-[#2a2a2a]">
          {(['all', ...STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#1a1a1a] border border-red-600/40 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-4 gap-3 mb-3">
            {(['name', 'email', 'company'] as const).map(field => (
              <input
                key={field}
                type={field === 'email' ? 'email' : 'text'}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
              />
            ))}
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as LeadStatus }))}
              className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowAdd(false); setForm(emptyForm) }} className="px-4 py-1.5 text-sm rounded-lg border border-[#2a2a2a] text-zinc-400 hover:bg-[#222]">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !form.name || !form.email} className="px-4 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-40">
              {saving ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              {['Name', 'Email', 'Company', 'Status', 'Last Contacted', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#222]">
                  {Array(6).fill(0).map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-[#222] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-zinc-600">No leads found</td>
              </tr>
            ) : (
              filtered.map(lead => (
                <>
                  <tr
                    key={lead.id}
                    className="border-b border-[#222] hover:bg-[#111] transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                  >
                    {editId === lead.id ? (
                      <>
                        <td className="px-4 py-3"><input defaultValue={lead.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="bg-[#111] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-red-600" /></td>
                        <td className="px-4 py-3"><input defaultValue={lead.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="bg-[#111] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-red-600" /></td>
                        <td className="px-4 py-3"><input defaultValue={lead.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} className="bg-[#111] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-red-600" /></td>
                        <td className="px-4 py-3">
                          <select defaultValue={lead.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as LeadStatus }))} className="bg-[#111] border border-[#2a2a2a] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-red-600">
                            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">{lead.last_contacted ? dayjs(lead.last_contacted).format('MMM D, YYYY') : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleEdit(lead.id)} disabled={saving} className="px-2 py-1 text-xs rounded bg-green-600/20 text-green-400 hover:bg-green-600/30">Save</button>
                            <button onClick={() => { setEditId(null); setEditForm({}) }} className="px-2 py-1 text-xs rounded border border-[#2a2a2a] text-zinc-400 hover:bg-[#222]">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-white font-medium">{lead.name}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{lead.email}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{lead.company}</td>
                        <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                        <td className="px-4 py-3 text-sm text-zinc-500">{lead.last_contacted ? dayjs(lead.last_contacted).format('MMM D, YYYY') : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setEditId(lead.id); setEditForm({}) }} className="px-2 py-1 text-xs rounded border border-[#2a2a2a] text-zinc-400 hover:border-zinc-500 hover:text-white">Edit</button>
                            <button onClick={() => setDeleteTarget(lead)} className="px-2 py-1 text-xs rounded border border-red-600/30 text-red-400 hover:bg-red-600/10">Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {expanded === lead.id && (
                    <tr key={`${lead.id}-exp`} className="border-b border-[#222] bg-[#111]">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Notes</label>
                            <textarea
                              defaultValue={lead.notes ?? ''}
                              onBlur={e => updateLead(lead.id, { notes: e.target.value })}
                              placeholder="Add notes about this lead..."
                              rows={3}
                              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Contact Info</label>
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 space-y-1">
                              <p className="text-sm text-zinc-300">{lead.email}</p>
                              <p className="text-sm text-zinc-500">{lead.company}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Lead"
          message={`Delete ${deleteTarget.name} from your leads? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
