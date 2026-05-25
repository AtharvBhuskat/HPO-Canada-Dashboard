export default function Settings() {
  const rows = [
    { label: 'Pipeline Schedule', value: 'Every Monday at 8:00 AM EST', icon: '🕗' },
    { label: 'Sending Address', value: 'marketing@hpocanada.com', icon: '📧' },
    { label: 'Notification Email', value: 'marketing@hpocanada.com', icon: '🔔' },
    { label: 'AWS Region', value: 'us-east-1 (N. Virginia)', icon: '🌐' },
    { label: 'Content Types', value: 'Blog, Email Newsletter, Video Scripts, Research Briefs', icon: '📄' },
    { label: 'API Base URL', value: 'https://xqjdxf8ntl.execute-api.us-east-1.amazonaws.com', icon: '🔗' },
  ]

  const links = [
    { label: 'AWS SES Console', url: 'https://console.aws.amazon.com/ses/home?region=us-east-1', desc: 'Manage sending identities and email sending' },
    { label: 'AWS Secrets Manager', url: 'https://console.aws.amazon.com/secretsmanager/home?region=us-east-1', desc: 'View and rotate API keys and secrets' },
    { label: 'AWS Amplify Console', url: 'https://console.aws.amazon.com/amplify/home?region=us-east-1', desc: 'Manage app deployments and environments' },
    { label: 'API Gateway Console', url: 'https://console.aws.amazon.com/apigateway/home?region=us-east-1', desc: 'View and test API endpoints' },
  ]

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-zinc-500 text-sm">System configuration and pipeline information</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Pipeline Configuration</h2>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          {rows.map((row, i) => (
            <div key={row.label} className={`flex items-center px-5 py-4 ${i < rows.length - 1 ? 'border-b border-[#222]' : ''}`}>
              <span className="text-base mr-3 w-6 text-center">{row.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 mb-0.5">{row.label}</p>
                <p className="text-sm text-white font-medium truncate">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">AWS Console Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-red-600/40 hover:bg-[#1f1f1f] transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">{link.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-zinc-600 group-hover:text-red-400 flex-shrink-0 ml-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">System Status</h2>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white">Pipeline is operational</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white">SES sending active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-sm text-white">Social OAuth — pending setup</span>
          </div>
        </div>
      </div>
    </div>
  )
}
