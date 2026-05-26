import { useEffect, useState, useCallback } from 'react'
import { getSocialAccounts, disconnectSocialAccount } from '../api'
import type { SocialAccount, Platform } from '../types'
import PlatformIcon from '../components/PlatformIcon'
import ConfirmModal from '../components/ConfirmModal'
import YouTubeUploadModal from '../components/YouTubeUploadModal'
import { getOAuthURL, isConnected, clearTokens } from '../lib/youtube'
import { getFacebookOAuthURL, isFacebookConnected, clearFacebookTokens } from '../lib/facebook'
import dayjs from 'dayjs'

const ALL_PLATFORMS: Platform[] = ['linkedin', 'instagram', 'facebook', 'youtube']

const platformLabels: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

const platformDescriptions: Record<Platform, string> = {
  linkedin: 'Professional network & B2B content',
  instagram: 'Visual content & brand awareness',
  facebook: 'Community & audience engagement',
  youtube: 'Video content & tutorials',
}

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState<Partial<Record<Platform, SocialAccount>>>({})
  const [loading, setLoading] = useState(true)
  const [disconnectTarget, setDisconnectTarget] = useState<Platform | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [ytConnected, setYtConnected] = useState(isConnected())
  const [fbConnected, setFbConnected] = useState(isFacebookConnected())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSocialAccounts()
      const map: Partial<Record<Platform, SocialAccount>> = {}
      data.items.forEach(a => { map[a.platform] = a })
      setAccounts(map)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDisconnect = async () => {
    if (!disconnectTarget) return
    setDisconnecting(true)
    try {
      if (disconnectTarget === 'youtube') {
        clearTokens()
        setYtConnected(false)
      } else if (disconnectTarget === 'facebook') {
        clearFacebookTokens()
        setFbConnected(false)
      } else {
        await disconnectSocialAccount(disconnectTarget)
        load()
      }
    } finally {
      setDisconnecting(false)
      setDisconnectTarget(null)
    }
  }

  const isYouTubeConnected = (platform: Platform) => {
    if (platform === 'youtube') return ytConnected
    if (platform === 'facebook') return fbConnected
    return accounts[platform]?.connected ?? false
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Social Accounts</h1>
        <p className="text-zinc-500 text-sm">Manage connected social media platforms</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_PLATFORMS.map(platform => {
            const account = accounts[platform]
            const connected = isYouTubeConnected(platform)

            return (
              <div
                key={platform}
                className={`bg-[#1a1a1a] border rounded-xl p-6 transition-colors ${
                  connected ? 'border-[#2a2a2a] hover:border-[#333]' : 'border-[#2a2a2a] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#111] flex items-center justify-center border border-[#2a2a2a]">
                      <PlatformIcon platform={platform} size={22} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{platformLabels[platform]}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{platformDescriptions[platform]}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    connected
                      ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                      : 'bg-zinc-800 text-zinc-500 border border-[#2a2a2a]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-zinc-600'}`} />
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {connected && platform !== 'youtube' && account && (
                  <div className="mb-4 bg-[#111] rounded-lg px-3 py-2.5 border border-[#2a2a2a]">
                    {account.account_name && (
                      <p className="text-sm text-zinc-300 font-medium">@{account.account_name}</p>
                    )}
                    {account.expires_at && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Token expires {dayjs(account.expires_at).format('MMM D, YYYY')}
                      </p>
                    )}
                  </div>
                )}

                {connected && platform === 'youtube' && (
                  <div className="mb-4 bg-[#111] rounded-lg px-3 py-2.5 border border-[#2a2a2a]">
                    <p className="text-sm text-green-400 font-medium">YouTube channel connected</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Ready to upload videos</p>
                  </div>
                )}
                {connected && platform === 'facebook' && (
                  <div className="mb-4 bg-[#111] rounded-lg px-3 py-2.5 border border-[#2a2a2a]">
                    <p className="text-sm text-green-400 font-medium">Facebook page connected</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Ready to post content</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {connected ? (
                    <>
                      {platform === 'youtube' && (
                        <button
                          onClick={() => setShowUpload(true)}
                          className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          Upload Video
                        </button>
                      )}
                      <button
                        onClick={() => setDisconnectTarget(platform)}
                        className={`py-2 text-sm font-medium rounded-lg border border-[#2a2a2a] text-zinc-400 hover:border-red-600/50 hover:text-red-400 transition-colors ${
                          platform === 'youtube' ? 'px-4' : 'flex-1'
                        }`}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (platform === 'youtube') window.location.href = getOAuthURL()
                        else if (platform === 'facebook') window.location.href = getFacebookOAuthURL()
                      }}
                      disabled={platform !== 'youtube' && platform !== 'facebook'}
                      title={platform !== 'youtube' && platform !== 'facebook' ? 'OAuth URL coming soon' : `Connect ${platformLabels[platform]}`}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        platform === 'youtube' || platform === 'facebook'
                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 cursor-pointer'
                          : 'bg-red-600/20 text-red-400 border border-red-600/30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {platform === 'youtube' || platform === 'facebook' ? `Connect ${platformLabels[platform]}` : 'Connect (Coming Soon)'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {disconnectTarget && (
        <ConfirmModal
          title={`Disconnect ${platformLabels[disconnectTarget]}`}
          message={`Are you sure you want to disconnect ${platformLabels[disconnectTarget]}? Scheduled posts for this platform will no longer go out.`}
          confirmLabel={disconnecting ? 'Disconnecting...' : 'Disconnect'}
          danger
          onConfirm={handleDisconnect}
          onCancel={() => setDisconnectTarget(null)}
        />
      )}

      {showUpload && <YouTubeUploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
