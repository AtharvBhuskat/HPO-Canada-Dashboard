import { Link } from 'react-router-dom'

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-white mt-2">Terms of Service</h1>
          <p className="text-zinc-500 text-sm mt-2">Last updated: June 14, 2026</p>
        </div>

        <p className="mb-8 text-zinc-400 leading-relaxed">
          Please read these Terms of Service ("Terms") carefully before using the HPO Canada Marketing Dashboard
          (the "Service") operated by HPO Canada ("we", "us", or "our"). By accessing or using the Service, you
          agree to be bound by these Terms. If you do not agree, do not use the Service.
        </p>

        <div className="space-y-8">
          <Section title="1. Use of the Service">
            <p className="mb-3 text-zinc-400">The Service is an internal marketing dashboard that allows authorized HPO Canada team members to:</p>
            <ul className="space-y-2 text-zinc-400">
              <li>Review, approve, and schedule AI-generated marketing content.</li>
              <li>Publish content to social media platforms including TikTok, LinkedIn, YouTube, and Facebook.</li>
              <li>Send email campaigns to opted-in contacts.</li>
              <li>Manage leads and inbox communications.</li>
            </ul>
            <p className="mt-3 text-zinc-400">Access to the Service is restricted to authorized personnel of HPO Canada only.</p>
          </Section>

          <Section title="2. Acceptable Use">
            <p className="mb-3 text-zinc-400">You agree to use the Service only for lawful purposes and in compliance with all applicable laws. You must not:</p>
            <ul className="space-y-2 text-zinc-400">
              <li>Use the Service to publish content that is unlawful, harmful, defamatory, obscene, or infringing on intellectual property rights.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
              <li>Use the Service in any manner that could impair or disrupt the Service or servers connected to it.</li>
              <li>Violate the terms of service of any connected third-party platform (TikTok, LinkedIn, YouTube, Facebook).</li>
              <li>Use the Service to send unsolicited communications or spam.</li>
            </ul>
          </Section>

          <Section title="3. Third-Party Platform Compliance">
            <p className="mb-3 text-zinc-400">
              The Service integrates with third-party platforms via their official APIs. By using these integrations,
              you agree to comply with the terms and policies of each platform:
            </p>
            <ul className="space-y-2">
              <li><a href="https://developers.tiktok.com/doc/overview" className="text-red-400 hover:text-red-300 underline transition-colors" target="_blank" rel="noreferrer">TikTok Platform Policy and API Terms of Service</a></li>
              <li><a href="https://www.linkedin.com/legal/l/api-terms-of-use" className="text-red-400 hover:text-red-300 underline transition-colors" target="_blank" rel="noreferrer">LinkedIn API Terms of Use</a></li>
              <li><a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" className="text-red-400 hover:text-red-300 underline transition-colors" target="_blank" rel="noreferrer">YouTube API Services Terms of Service</a></li>
              <li><a href="https://developers.facebook.com/terms/" className="text-red-400 hover:text-red-300 underline transition-colors" target="_blank" rel="noreferrer">Facebook Platform Terms</a></li>
            </ul>
            <p className="mt-3 text-zinc-400">
              We access these platforms' APIs only to perform actions explicitly authorized by you. We do not use
              API data beyond the scope of operating the Service.
            </p>
          </Section>

          <Section title="4. TikTok API Compliance">
            <p className="mb-3 text-zinc-400">Our integration with TikTok is subject to TikTok's Platform Policy. Specifically:</p>
            <ul className="space-y-2 text-zinc-400">
              <li>We use TikTok API only to upload and publish video content on behalf of authorized users.</li>
              <li>We do not scrape, store, or redistribute TikTok user data beyond what is required to operate the Service.</li>
              <li>Content published through this Service must comply with TikTok's Community Guidelines and advertising policies.</li>
              <li>You are solely responsible for ensuring that all content you publish via TikTok through this Service is compliant with applicable laws and TikTok's policies.</li>
              <li>We reserve the right to suspend TikTok integration if we become aware of any policy violations.</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <p className="text-zinc-400 leading-relaxed">
              All content you create and publish using the Service remains your property. You grant HPO Canada a
              limited license to process and transmit your content solely to operate the Service. The Service itself,
              including its design, code, and branding, is the intellectual property of HPO Canada and may not be
              copied or reproduced without permission.
            </p>
          </Section>

          <Section title="6. Disclaimers">
            <p className="mb-3 text-zinc-400">The Service is provided "as is" without warranties of any kind, express or implied. We do not warrant that:</p>
            <ul className="space-y-2 text-zinc-400">
              <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
              <li>Any results obtained from using the Service will be accurate or reliable.</li>
              <li>AI-generated content will be free from errors, omissions, or inaccuracies.</li>
            </ul>
            <p className="mt-3 text-zinc-400">
              You are responsible for reviewing all AI-generated content before publishing. HPO Canada is not liable
              for any content published through the Service.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p className="text-zinc-400 leading-relaxed">
              To the fullest extent permitted by law, HPO Canada shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of the Service, including but not
              limited to loss of data, loss of revenue, or reputational harm.
            </p>
          </Section>

          <Section title="8. Termination">
            <p className="text-zinc-400 leading-relaxed">
              We reserve the right to suspend or terminate your access to the Service at any time, with or without
              notice, for conduct that we believe violates these Terms or is harmful to other users, us, third-party
              platforms, or the public.
            </p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p className="text-zinc-400 leading-relaxed">
              We may revise these Terms at any time. We will notify users of material changes by updating the
              "Last updated" date. Continued use of the Service after changes take effect constitutes acceptance
              of the new Terms.
            </p>
          </Section>

          <Section title="10. Governing Law">
            <p className="text-zinc-400 leading-relaxed">
              These Terms are governed by the laws of the Province of Ontario, Canada, without regard to its
              conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts
              of Ontario, Canada.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p className="text-zinc-400 mb-3">For questions about these Terms, please contact:</p>
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-4 space-y-1">
              <p className="text-white font-medium">HPO Canada</p>
              <p className="text-zinc-400 text-sm">Email: <a href="mailto:marketing@hpocanada.com" className="text-red-400 hover:text-red-300 transition-colors">marketing@hpocanada.com</a></p>
              <p className="text-zinc-400 text-sm">Website: <a href="https://hpocanada.com" className="text-red-400 hover:text-red-300 transition-colors" target="_blank" rel="noreferrer">https://hpocanada.com</a></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1e1e1e] flex gap-6 text-xs text-zinc-600">
          <Link to="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
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
