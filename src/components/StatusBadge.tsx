import type { ContentStatus, LeadStatus } from '../types'

type Status = ContentStatus | LeadStatus

const config: Record<Status, { label: string; classes: string }> = {
  pending:   { label: 'Pending',   classes: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  approved:  { label: 'Approved',  classes: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  rejected:  { label: 'Rejected',  classes: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  scheduled: { label: 'Scheduled', classes: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  posted:    { label: 'Posted',    classes: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  cold:      { label: 'Cold',      classes: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30' },
  warm:      { label: 'Warm',      classes: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  active:    { label: 'Active',    classes: 'bg-green-500/20 text-green-400 border border-green-500/30' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, classes } = config[status] ?? { label: status, classes: 'bg-zinc-800 text-zinc-400' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}
