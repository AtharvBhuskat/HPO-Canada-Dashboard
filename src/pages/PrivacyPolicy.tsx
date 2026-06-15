export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 14, 2026</p>

      <p className="mb-6">
        HPO Canada ("we", "us", or "our") operates the HPO Canada Marketing Dashboard (the "Service"). This Privacy
        Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
        Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p className="mb-3">We may collect the following categories of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account information:</strong> Name, email address, and credentials used to access the dashboard.</li>
          <li><strong>Social media tokens:</strong> OAuth access tokens for connected platforms (LinkedIn, YouTube, Facebook, TikTok). These are stored locally in your browser and are never transmitted to our servers except when required to complete an API action on your behalf.</li>
          <li><strong>Content data:</strong> Posts, captions, images, and videos you create or schedule through the Service.</li>
          <li><strong>Usage data:</strong> Log data, browser type, pages visited, and timestamps for Service improvement.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To operate and maintain the Service.</li>
          <li>To publish content to connected social media accounts on your behalf, including TikTok, LinkedIn, YouTube, and Facebook.</li>
          <li>To send email campaigns using Amazon SES on your behalf.</li>
          <li>To provide AI-assisted content generation and scheduling.</li>
          <li>To improve, personalize, and expand the Service.</li>
          <li>To communicate with you about updates, security alerts, and support messages.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. TikTok API Data</h2>
        <p className="mb-3">
          Our Service integrates with the TikTok Content Posting API. When you connect your TikTok account:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We request only the permissions necessary to upload and publish video content on your behalf.</li>
          <li>TikTok OAuth tokens are stored in your browser's local storage and are used solely to authenticate API requests you initiate.</li>
          <li>We do not sell, rent, or share your TikTok account data or content with any third parties beyond what is required to operate the Service.</li>
          <li>We do not store TikTok video content on our servers beyond the temporary duration required to complete an upload.</li>
          <li>Data obtained through the TikTok API is used only for the purposes described in this policy and in compliance with <a href="https://developers.tiktok.com/doc/overview" className="text-blue-600 underline" target="_blank" rel="noreferrer">TikTok's API Terms of Service</a>.</li>
          <li>You may disconnect your TikTok account at any time from the Social Accounts page of the dashboard, which will remove all stored tokens.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
        <p className="mb-3">We do not sell your personal information. We may share data with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Service providers:</strong> AWS (hosting, email delivery, AI services) under appropriate data processing agreements.</li>
          <li><strong>Social platforms:</strong> LinkedIn, YouTube, Facebook, and TikTok, only to the extent required to publish content you authorize.</li>
          <li><strong>Legal requirements:</strong> If required by law or to protect the rights and safety of our users.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
        <p>
          OAuth tokens are stored in your browser's local storage and expire according to each platform's schedule
          (typically 60 days). We retain content and scheduling records in our backend for as long as your account
          is active or as needed to provide the Service. You may request deletion of your data at any time by
          contacting us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Security</h2>
        <p>
          We implement industry-standard security measures including HTTPS encryption, AWS IAM role-based access
          control, and least-privilege API permissions. No method of transmission over the internet is 100% secure,
          and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
        <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Withdraw consent for data processing at any time.</li>
          <li>Lodge a complaint with a supervisory authority.</li>
        </ul>
        <p className="mt-3">To exercise these rights, contact us at the address below.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
        <p>
          The Service is not directed to individuals under the age of 13. We do not knowingly collect personal
          information from children. If you believe we have inadvertently collected such information, please
          contact us immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant changes by
          updating the "Last updated" date at the top of this page. Continued use of the Service after changes
          constitutes acceptance of the revised policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us:</p>
        <div className="mt-3">
          <p><strong>HPO Canada</strong></p>
          <p>Email: <a href="mailto:marketing@hpocanada.com" className="text-blue-600 underline">marketing@hpocanada.com</a></p>
          <p>Website: <a href="https://hpocanada.com" className="text-blue-600 underline" target="_blank" rel="noreferrer">https://hpocanada.com</a></p>
        </div>
      </section>
    </div>
  )
}
