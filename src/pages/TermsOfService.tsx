export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 14, 2026</p>

      <p className="mb-6">
        Please read these Terms of Service ("Terms") carefully before using the HPO Canada Marketing Dashboard
        (the "Service") operated by HPO Canada ("we", "us", or "our"). By accessing or using the Service, you
        agree to be bound by these Terms. If you do not agree, do not use the Service.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Use of the Service</h2>
        <p className="mb-3">The Service is an internal marketing dashboard that allows authorized HPO Canada team members to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Review, approve, and schedule AI-generated marketing content.</li>
          <li>Publish content to social media platforms including TikTok, LinkedIn, YouTube, and Facebook.</li>
          <li>Send email campaigns to opted-in contacts.</li>
          <li>Manage leads and inbox communications.</li>
        </ul>
        <p className="mt-3">Access to the Service is restricted to authorized personnel of HPO Canada only.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Acceptable Use</h2>
        <p className="mb-3">You agree to use the Service only for lawful purposes and in compliance with all applicable laws. You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the Service to publish content that is unlawful, harmful, defamatory, obscene, or infringing on intellectual property rights.</li>
          <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
          <li>Use the Service in any manner that could impair or disrupt the Service or servers connected to it.</li>
          <li>Violate the terms of service of any connected third-party platform (TikTok, LinkedIn, YouTube, Facebook).</li>
          <li>Use the Service to send unsolicited communications or spam.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Third-Party Platform Compliance</h2>
        <p className="mb-3">
          The Service integrates with third-party platforms via their official APIs. By using these integrations,
          you agree to comply with the terms and policies of each platform:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><a href="https://developers.tiktok.com/doc/overview" className="text-blue-600 underline" target="_blank" rel="noreferrer">TikTok Platform Policy and API Terms of Service</a></li>
          <li><a href="https://www.linkedin.com/legal/l/api-terms-of-use" className="text-blue-600 underline" target="_blank" rel="noreferrer">LinkedIn API Terms of Use</a></li>
          <li><a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" className="text-blue-600 underline" target="_blank" rel="noreferrer">YouTube API Services Terms of Service</a></li>
          <li><a href="https://developers.facebook.com/terms/" className="text-blue-600 underline" target="_blank" rel="noreferrer">Facebook Platform Terms</a></li>
        </ul>
        <p className="mt-3">
          We access these platforms' APIs only to perform actions explicitly authorized by you. We do not use
          API data beyond the scope of operating the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. TikTok API Compliance</h2>
        <p className="mb-3">Our integration with TikTok is subject to TikTok's Platform Policy. Specifically:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We use TikTok API only to upload and publish video content on behalf of authorized users.</li>
          <li>We do not scrape, store, or redistribute TikTok user data beyond what is required to operate the Service.</li>
          <li>Content published through this Service must comply with TikTok's Community Guidelines and advertising policies.</li>
          <li>You are solely responsible for ensuring that all content you publish via TikTok through this Service is compliant with applicable laws and TikTok's policies.</li>
          <li>We reserve the right to suspend TikTok integration if we become aware of any policy violations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
        <p>
          All content you create and publish using the Service remains your property. You grant HPO Canada a
          limited license to process and transmit your content solely to operate the Service. The Service itself,
          including its design, code, and branding, is the intellectual property of HPO Canada and may not be
          copied or reproduced without permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Disclaimers</h2>
        <p className="mb-3">
          The Service is provided "as is" without warranties of any kind, express or implied. We do not warrant that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
          <li>Any results obtained from using the Service will be accurate or reliable.</li>
          <li>AI-generated content will be free from errors, omissions, or inaccuracies.</li>
        </ul>
        <p className="mt-3">
          You are responsible for reviewing all AI-generated content before publishing. HPO Canada is not liable
          for any content published through the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, HPO Canada shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising from your use of the Service, including but not
          limited to loss of data, loss of revenue, or reputational harm.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the Service at any time, with or without
          notice, for conduct that we believe violates these Terms or is harmful to other users, us, third-party
          platforms, or the public.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Changes to These Terms</h2>
        <p>
          We may revise these Terms at any time. We will notify users of material changes by updating the
          "Last updated" date. Continued use of the Service after changes take effect constitutes acceptance
          of the new Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the Province of Ontario, Canada, without regard to its
          conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts
          of Ontario, Canada.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
        <p>For questions about these Terms, please contact:</p>
        <div className="mt-3">
          <p><strong>HPO Canada</strong></p>
          <p>Email: <a href="mailto:marketing@hpocanada.com" className="text-blue-600 underline">marketing@hpocanada.com</a></p>
          <p>Website: <a href="https://hpocanada.com" className="text-blue-600 underline" target="_blank" rel="noreferrer">https://hpocanada.com</a></p>
        </div>
      </section>
    </div>
  )
}
