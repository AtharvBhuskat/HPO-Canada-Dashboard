import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#111111] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">HPO Canada</p>
              <p className="text-zinc-500 text-xs mt-0.5">Marketing Hub</p>
            </div>
          </div>
          <Link to="/" className="text-xs text-zinc-500 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <span className="text-xs font-medium text-red-500 uppercase tracking-widest">Legal</span>
          <h1 className="text-3xl font-bold text-white mt-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm mt-2">Last updated: June 14, 2026</p>
        </div>

        <p className="mb-8 text-zinc-400 leading-relaxed">
          HPO Canada ("we", "us", or "our") operates the HPO Canada Marketing Dashboard (the "Service"). This Privacy
          Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.
        </p>

        <div className="space-y-8">
          <Section title="1. Information We Collect">
            <p className="mb-3 text-zinc-400">We may collect the following categories of information:</p>
            <ul className="space-y-2">
              <li><span className="text-white font-medium">Account information:</span> <span className="text-zinc-400">Name, email address, and credentials used to access the dashboard.</span></li>
              <li><span className="text-white font-medium">Social media tokens:</span> <span className="text-zinc-400">OAuth access tokens for connected platforms (LinkedIn, YouTube, Facebook, TikTok). These are stored locally in your browser and are never transmitted to our servers except when required to complete an API action on your behalf.</span></li>
              <li><span className="text-white font-medium">Content data:</span> <span className="text-zinc-400">Posts, captions, images, and videos you create or schedule through the Service.</span></li>
              <li><span className="text-white font-medium">Usage data:</span> <span className="text-zinc-400">Log data, browser type, pages visited, and timestamps for Service improvement.</span></li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="space-y-2 text-zinc-400">
              <li>To operate and maintain the Service.</li>
              <li>To publish content to connected social media accounts on your behalf, including TikTok, LinkedIn, YouTube, and Facebook.</li>
              <li>To send email campaigns using Amazon SES on your behalf.</li>
              <li>To provide AI-assisted content generation and scheduling.</li>
              <li>To improve, personalize, and expand the Service.</li>
              <li>To communicate with you about updates, security alerts, and support messages.</li>
            </ul>
          </Section>

          <Section title="3. TikTok API Data">
            <p className="mb-3 text-zinc-400">Our Service integrates with the TikTok Content Posting API. When you connect your TikTok account:</p>
            <ul className="space-y-2 text-zinc-400">
              <li>We request only the permissions necessary to upload and publish video content on your behalf.</li>
              <li>TikTok OAuth tokens are stored in your browser's local storage and are used solely to authenticate API requests you initiate.</li>
              <li>We do not sell, rent, or share your TikTok account data or content with any third parties beyond what is required to operate the Service.</li>
              <li>We do not store TikTok video content on our servers beyond the temporary duration required to complete an upload.</li>
              <li>Data obtained through the TikTok API is used only for the purposes described in this policy and in compliance with{' '}
                <a href="https://developers.tiktok.com/doc/overview" className="text-red-400 hover:text-red-300 underline transition-colors" target="_blank" rel="noreferrer">TikTok's API Terms of Service</a>.
              </li>
              <li>You may disconnect your TikTok account at any time from the Social Accounts page of the dashboard, which will remove all stored tokens.</li>
            </ul>
          </Section>

          <Section title="4. Data Sharing and Disclosure">
            <p className="mb-3 text-zinc-400">We do not sell your personal information. We may share data with:</p>
            <ul className="space-y-2 text-zinc-400">
              <li><span className="text-white font-medium">Service providers:</span> AWS (hosting, email delivery, AI services) under appropriate data processing agreements.</li>
              <li><span className="text-white font-medium">Social platforms:</span> LinkedIn, YouTube, Facebook, and TikTok, only to the extent required to publish content you authorize.</li>
              <li><span className="text-white font-medium">Legal requirements:</span> If required by law or to protect the rights and safety of our users.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p className="text-zinc-400 leading-relaxed">
              OAuth tokens are stored in your browser's local storage and expire according to each platform's schedule
              (typically 60 days). We retain content and scheduling records in our backend for as long as your account
              is active or as needed to provide the Service. You may request deletion of your data at any time by
              contacting us.
            </p>
          </Section>

          <Section title="6. Security">
            <p className="text-zinc-400 leading-relaxed">
              We implement industry-standard security measures including HTTPS encryption, AWS IAM role-based access
              control, and least-privilege API permissions. No method of transmission over the internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p className="mb-3 text-zinc-400">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="space-y-2 text-zinc-400">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Withdraw consent for data processing at any time.</li>
              <li>Lodge a complaint with a supervisory authority.</li>
            </ul>
            <p className="mt-3 text-zinc-400">To exercise these rights, contact us at the address below.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p className="text-zinc-400 leading-relaxed">
              The Service is not directed to individuals under the age of 13. We do not knowingly collect personal
              information from children. If you believe we have inadvertently collected such information, please
              contact us immediately.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p className="text-zinc-400 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by
              updating the "Last updated" date at the top of this page. Continued use of the Service after changes
              constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p className="text-zinc-400 mb-3">If you have questions about this Privacy Policy, please contact us:</p>
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-lg p-4 space-y-1">
              <p className="text-white font-medium">HPO Canada</p>
              <p className="text-zinc-400 text-sm">Email: <a href="mailto:marketing@hpocanada.com" className="text-red-400 hover:text-red-300 transition-colors">marketing@hpocanada.com</a></p>
              <p className="text-zinc-400 text-sm">Website: <a href="https://hpocanada.com" className="text-red-400 hover:text-red-300 transition-colors" target="_blank" rel="noreferrer">https://hpocanada.com</a></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1e1e1e] flex gap-6 text-xs text-zinc-600">
          <Link to="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          <a href="https://hpocanada.com" target="_blank" rel="noreferrer" className="hover:text-zinc-400 transition-colors">hpocanada.com</a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#1e1e1e] rounded-xl p-6 bg-[#111111]">
      <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-red-600 rounded-full inline-block" />
        {title}
      </h2>
      {children}
    </div>
  )
}
