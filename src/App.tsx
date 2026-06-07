import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ContentQueue from './pages/ContentQueue'
import Schedule from './pages/Schedule'
import SocialAccounts from './pages/SocialAccounts'
import EmailCampaigns from './pages/EmailCampaigns'
import Inbox from './pages/Inbox'
import Leads from './pages/Leads'
import Settings from './pages/Settings'
import AiAssistant from './pages/AiAssistant'
import YouTubeCallback from './pages/YouTubeCallback'
import FacebookCallback from './pages/FacebookCallback'
import TikTokCallback from './pages/TikTokCallback'
import LinkedInCallback from './pages/LinkedInCallback'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* OAuth callbacks — no sidebar */}
        <Route path="/auth/youtube" element={<YouTubeCallback />} />
        <Route path="/auth/facebook" element={<FacebookCallback />} />
        <Route path="/auth/tiktok" element={<TikTokCallback />} />
        <Route path="/auth/linkedin" element={<LinkedInCallback />} />

        {/* Main app — with sidebar */}
        <Route path="*" element={
          <div className="flex min-h-screen bg-[#0a0a0a]">
            <Sidebar />
            <main className="flex-1 ml-60 min-h-screen overflow-auto">
              <Routes>
                <Route path="/"          element={<ContentQueue />} />
                <Route path="/schedule"  element={<Schedule />} />
                <Route path="/social"    element={<SocialAccounts />} />
                <Route path="/campaigns" element={<EmailCampaigns />} />
                <Route path="/inbox"     element={<Inbox />} />
                <Route path="/leads"     element={<Leads />} />
                <Route path="/settings"  element={<Settings />} />
                <Route path="/ai"        element={<AiAssistant />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
