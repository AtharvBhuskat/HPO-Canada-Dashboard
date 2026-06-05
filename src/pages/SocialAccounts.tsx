import { useEffect, useState, useCallback } from 'react'
import { getSocialAccounts, disconnectSocialAccount } from '../api'
import type { SocialAccount, Platform } from '../types'
import PlatformIcon from '../components/PlatformIcon'
import ConfirmModal from '../components/ConfirmModal'
import YouTubeUploadModal from '../components/YouTubeUploadModal'
import FacebookPostModal from '../components/FacebookPostModal'
import InstagramPostModal from '../components/InstagramPostModal'
import TikTokUploadModal from '../components/TikTokUploadModal'
import { getOAuthURL, isConnected, clearTokens } from '../lib/youtube'
import { getFacebookOAuthURL, isFacebookConnected, clearFacebookTokens } from '../lib/facebook'
import { connectInstagram, isInstagramConnected, clearInstagramAccount, getInstagramAccount } from '../lib/instagram'
import { getTikTokAuthUrl, isTikTokConnected, clearTikTokTokens } from '../lib/tiktok'
import dayjs from 'dayjs'

const ALL_PLATFORMS: Platform[] = ['linkedin', 'instagram', 'facebook', 'youtube', 'tiktok', 'reddit', 'twitter']
const COMING_SOON: Platform[] = ['reddit', 'twitter']

const platformLabels: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  reddit: 'Reddit',
  twitter: 'X (Twitter)',
}

const platformDescriptions: Record<Platform, string> = {
  linkedin: 'Professional network & B2B content',
  instagram: 'Visual content & brand awareness',
  facebook: 'Community & audience engagement',
  youtube: 'Video content & tutorials',
  tiktok: 'Short-form video & viral content',
  reddit: 'Community discussions & AMAs',
  twitter: 'Real-time updates & engagement',
}

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState<Partial<Record<Platform, SocialAccount>>>({})
  const [loading, setLoading] = useState(true)
  const [disconnectTarget, setDisconnectTarget] = useState<Platform | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showFbPost, setShowFbPost] = useState(false)
  const [showIgPost, setShowIgPost] = useState(false)
  const [showTtUpload, setShowTtUpload] = useState(false)
  const [ytConnected, setYtConnected] = useState(isConnected())
  const [fbConnected, setFbConnected] = useState(isFacebookConnected())
  const [igConnected, setIgConnected] = useState(isInstagramConnected())
  const [ttConnected, setTtConnected] = useState(isTikTokConnected())
  const [igConnecting, setIgConnecting] = useState(false)
  const [igError, setIgError] = useState('')

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

  const handleConnectInstagram = async () => {
    setIgConnecting(true)
    setIgError('')
    try {
      await connectInstagram()
      setIgConnected(true)
    } catch (e: unknown) {
      setIgError(e instanceof Error ? e.message : 'Failed to connect Instagram')
    } finally {
      setIgConnecting(false)
    }
  }

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
      } else if (disconnectTarget === 'instagram') {
        clearInstagramAccount()
        setIgConnected(false)
      } else if (disconnectTarget === 'tiktok') {
        clearTikTokTokens()
        setTtConnected(false)
      } else {
        await disconnectSocialAccount(disconnectTarget)
        load()
      }
    } finally {
      setDisconnecting(false)
      setDisconnectTarget(null)
    }
  }

  const isConnectedPlatform = (platform: Platform) => {
    if (platform === 'youtube') return ytConnected
    if (platform === 'facebook') return fbConnected
    if (platform === 'instagram') return igConnected
    if (platform === 'tiktok') return ttConnected
    return accounts[platform]?.connected ?? false
  }

  const igAccount = getInstagramAccount()

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
            const connected = isConnectedPlatform(platform)
            const isComingSoon = COMING_SOON.includes(platform)

            return (
              <div
                key={platform}
                className={`bg-[#1a1a1a] border rounded-xl p-6 transition-colors ${
                  isComingSoon ? 'border-blue-500/20 bg-[#1a1a2a]' : connected ? 'border-[#2a2a2a] hover:border-[#333]' : 'border-[#2a2a2a] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${isComingSoon ? 'bg-blue-500/10 border-blue-500/20' : 'bg-[#111] border-[#2a2a2a]'}`}>
                      <PlatformIcon platform={platform} size={22} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{platformLabels[platform]}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{platformDescriptions[platform]}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    isComingSoon
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : connected
                        ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                        : 'bg-zinc-800 text-zinc-500 border border-[#2a2a2a]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isComingSoon ? 'bg-blue-400 animate-pulse' : connected ? 'bg-green-400' : 'bg-zinc-600'}`} />
                    {isComingSoon ? 'In Progress' : connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* In-progress info */}
                {isComingSoon && (
                  <div className="mb-4 bg-blue-500/5 rounded-lg px-3 py-2.5 border border-blue-500/15">
                    <p className="text-sm text-blue-400 font-medium">Integration being set up</p>
                    <p className="text-xs text-zinc-500 mt-0.5">OAuth & API connection in development</p>
                  </div>
                )}

                {/* Account info */}
                {connected && platform !== 'youtube' && platform !== 'facebook' && platform !== 'instagram' && account && (
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

                {connected && platform === 'instagram' && igAccount && (
                  <div className="mb-4 bg-[#111] rounded-lg px-3 py-2.5 border border-[#2a2a2a]">
                    <p className="text-sm text-green-400 font-medium">@{igAccount.username}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Ready to post photos & reels</p>
                  </div>
                )}

                {connected && platform === 'tiktok' && (
                  <div className="mb-4 bg-[#111] rounded-lg px-3 py-2.5 border border-[#2a2a2a]">
                    <p className="text-sm text-green-400 font-medium">TikTok account connected</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Ready to upload short-form videos</p>
                  </div>
                )}

                {/* Instagram error */}
                {platform === 'instagram' && igError && (
                  <div className="mb-4 bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2">
                    <p className="text-red-400 text-xs">{igError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {isComingSoon ? (
                    <button
                      disabled
                      className="flex-1 py-2 text-sm font-medium rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400/60 cursor-not-allowed"
                    >
                      Integration in Progress
                    </button>
                  ) : connected ? (
                    <>
                      {platform === 'youtube' && (
                        <button
                          onClick={() => setShowUpload(true)}
                          className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          Upload Video
                        </button>
                      )}
                      {platform === 'facebook' && (
                        <button
                          onClick={() => setShowFbPost(true)}
                          className="flex-1 py-2 text-sm font-medium rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white transition-colors"
                        >
                          Post to Page
                        </button>
                      )}
                      {platform === 'instagram' && (
                        <button
                          onClick={() => setShowIgPost(true)}
                          className="flex-1 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                          style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}
                        >
                          Post to Instagram
                        </button>
                      )}
                      {platform === 'tiktok' && (
                        <button
                          onClick={() => setShowTtUpload(true)}
                          className="flex-1 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                          style={{ background: '#FE2C55' }}
                        >
                          Upload Video
                        </button>
                      )}
                      <button
                        onClick={() => setDisconnectTarget(platform)}
                        className={`py-2 text-sm font-medium rounded-lg border border-[#2a2a2a] text-zinc-400 hover:border-red-600/50 hover:text-red-400 transition-colors ${
                          platform === 'youtube' || platform === 'facebook' || platform === 'instagram' || platform === 'tiktok' ? 'px-4' : 'flex-1'
                        }`}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <>
                      {platform === 'instagram' ? (
                        <button
                          onClick={handleConnectInstagram}
                          disabled={igConnecting || !fbConnected}
                          title={!fbConnected ? 'Connect Facebook first' : 'Connect Instagram'}
                          className="flex-1 py-2 text-sm font-medium rounded-lg text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}
                        >
                          {igConnecting ? 'Connecting...' : !fbConnected ? 'Connect Facebook First' : 'Connect Instagram'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (platform === 'youtube') window.location.href = getOAuthURL()
                            else if (platform === 'facebook') window.location.href = getFacebookOAuthURL()
                            else if (platform === 'tiktok') window.location.href = getTikTokAuthUrl()
                          }}
                          disabled={platform !== 'youtube' && platform !== 'facebook' && platform !== 'tiktok'}
                          title={`Connect ${platformLabels[platform]}`}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            platform === 'youtube' || platform === 'facebook'
                              ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 cursor-pointer'
                              : platform === 'tiktok'
                                ? 'text-white border-transparent cursor-pointer hover:opacity-90'
                                : 'bg-red-600/20 text-red-400 border border-red-600/30 opacity-60 cursor-not-allowed'
                          }`}
                          style={platform === 'tiktok' ? { background: '#FE2C55' } : undefined}
                        >
                          {platform === 'tiktok' ? 'Connect TikTok' : platform === 'youtube' || platform === 'facebook' ? `Connect ${platformLabels[platform]}` : 'Connect (Coming Soon)'}
                        </button>
                      )}
                    </>
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
      {showFbPost && <FacebookPostModal onClose={() => setShowFbPost(false)} />}
      {showIgPost && <InstagramPostModal onClose={() => setShowIgPost(false)} />}
      {showTtUpload && <TikTokUploadModal onClose={() => setShowTtUpload(false)} />}
    </div>
  )
}
