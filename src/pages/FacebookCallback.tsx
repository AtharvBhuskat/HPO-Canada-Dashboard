import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeFacebookCode, getFacebookPage, fetchPageById } from '../lib/facebook'

export default function FacebookCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'nopage' | 'error'>('loading')
  const [error, setError] = useState('')
  const [pageId, setPageId] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')

  useEffect(() => {
    const code = params.get('code')
    const err = params.get('error')

    if (err) {
      setStatus('error')
      setError('Facebook login was cancelled or denied.')
      return
    }

    if (!code) {
      setStatus('error')
      setError('No authorization code received.')
      return
    }

    exchangeFacebookCode(code)
      .then(() => {
        if (getFacebookPage()) {
          setStatus('success')
          setTimeout(() => navigate('/social'), 1500)
        } else {
          setStatus('nopage')
        }
      })
      .catch(e => {
        setStatus('error')
        setError(e.message)
      })
  }, [params, navigate])

  const handleLinkPage = async () => {
    if (!pageId.trim()) return
    setLinking(true)
    setLinkError('')
    try {
      await fetchPageById(pageId.trim())
      setStatus('success')
      setTimeout(() => navigate('/social'), 1500)
    } catch (e: unknown) {
      setLinkError(e instanceof Error ? e.message : 'Failed to link page')
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-sm text-center shadow-2xl">

        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <p className="text-white font-medium">Connecting Facebook...</p>
            <p className="text-zinc-500 text-sm mt-1">Exchanging credentials</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">Facebook Connected!</p>
            <p className="text-zinc-500 text-sm mt-1">Redirecting to Social Accounts...</p>
          </>
        )}

        {status === 'nopage' && (
          <>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">Connected — Page Not Found</p>
            <p className="text-zinc-500 text-sm mb-5">Enter your Facebook Page ID to link it manually</p>

            <input
              type="text"
              value={pageId}
              onChange={e => setPageId(e.target.value)}
              placeholder="e.g. 1128327817032343"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#1877F2] transition-colors mb-3"
            />

            {linkError && (
              <p className="text-red-400 text-xs mb-3">{linkError}</p>
            )}

            <button
              onClick={handleLinkPage}
              disabled={linking || !pageId.trim()}
              className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 mb-3"
            >
              {linking ? 'Linking...' : 'Link Page'}
            </button>

            <p className="text-zinc-600 text-xs">
              Find your Page ID on your Facebook Page → About section
            </p>

            <button
              onClick={() => navigate('/social')}
              className="mt-4 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Skip for now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-white font-medium">Connection Failed</p>
            <p className="text-zinc-500 text-sm mt-2">{error}</p>
            <button
              onClick={() => navigate('/social')}
              className="mt-5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Back to Social Accounts
            </button>
          </>
        )}

      </div>
    </div>
  )
}
