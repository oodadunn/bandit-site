import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Bandit Recycling",
  description: "Privacy Policy for Bandit Recycling — how we collect, use, and protect your personal information, including SMS/text message data.",
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "April 4, 2026";
const COMPANY = "Bandit Recycling LLC";
const WEBSITE = "https://banditrecycling.com";
const EMAIL = "service@banditrecycling.com";
const PHONE = "1-800-4BANDIT";

export default function PrivacyPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* Header */}
      <div className="bg-[#050505] border-b border-[#1F2937] py-12">
        <div className="container-site">
          <div className="badge-green mb-4">Legal</div>
          <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-site py-16">
        <div className="max-w-3xl">
          <div className="mb-8 p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl">
            <p className="text-sm text-[#39FF14] font-semibold mb-1">Summary</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Bandit Recycling collects information you provide to get you quotes and service. We do <strong>not</strong> sell your personal information or share it with third parties for their marketing purposes. SMS opt-in data is never shared with third parties.
            </p>
          </div>

          <div className="prose-legal">

            <Section title="1. Who We Are">
              <p>
                {COMPANY} (&ldquo;Bandit,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website at <strong>{WEBSITE}</strong> and provides baler repair, preventive maintenance, equipment sales and leasing, and bale wire supply services in the Southeast United States.
              </p>
              <p>
                This Privacy Policy describes how we collect, use, disclose, and protect personal information we receive from individuals who visit our Site, submit forms, or communicate with us.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <Subsection title="2.1 Information You Provide Directly">
                <p>We collect information you voluntarily provide to us, including when you:</p>
                <ul>
                  <li>Submit a quote or service request form</li>
                  <li>Call or email us</li>
                  <li>Sign up for SMS communications</li>
                  <li>Enter into a service agreement with us</li>
                </ul>
                <p>This information may include:</p>
                <ul>
                  <li>Name and job title</li>
                  <li>Company name and address</li>
                  <li>Phone number (including mobile number for SMS)</li>
                  <li>Email address</li>
                  <li>State / location</li>
                  <li>Equipment type and service details</li>
                  <li>Urgency level and service history</li>
                </ul>
              </Subsection>

              <Subsection title="2.2 Information Collected Automatically">
                <p>When you visit our Site, we may automatically collect certain technical information, including:</p>
                <ul>
                  <li>IP address and general geographic location</li>
                  <li>Browser type and version</li>
                  <li>Pages visited, time on page, and referring URL</li>
                  <li>Device type and operating system</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
                <p>This information is collected to operate and improve the Site and does not identify you personally unless combined with other information you have provided.</p>
              </Subsection>

              <Subsection title="2.3 Information from Third Parties">
                <p>We may receive information about you from third parties such as advertising platforms or analytics providers, which we may combine with information you have provided to us.</p>
              </Subsection>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li>To respond to your service and quote requests</li>
                <li>To dispatch technicians and manage active service orders</li>
                <li>To send appointment confirmations and service status updates</li>
                <li>To process payments and fulfill service agreements</li>
                <li>To send SMS messages you have opted in to receive (see Section 4)</li>
                <li>To improve and personalize your experience on our Site</li>
                <li>To communicate with you about your account or services</li>
                <li>To comply with legal obligations and enforce our agreements</li>
                <li>To protect the security and integrity of our business and Site</li>
              </ul>
              <p>
                We will not use your personal information for purposes materially different from those described in this Policy without providing notice and, where required by law, obtaining your consent.
              </p>
            </Section>

            <Section title="4. SMS / Text Message Communications">
              <Subsection title="4.1 Opt-In Consent">
                <p>
                  By providing your mobile phone number and submitting a form on our Site (or otherwise expressly opting in), you consent to receive SMS text messages from Bandit Recycling at the mobile number provided. Messages may include service updates, appointment reminders, technician dispatch notifications, and responses to your service requests.
                </p>
              </Subsection>

              <Subsection title="4.2 No Sharing of SMS Consent or Data">
                <p>
                  <strong>Your SMS opt-in consent and mobile phone number will NOT be shared, sold, rented, or disclosed to any third party or affiliate for marketing or promotional purposes.</strong> This applies regardless of any other data-sharing practices described in this Policy.
                </p>
              </Subsection>

              <Subsection title="4.3 Message Frequency">
                <p>
                  Message frequency varies depending on your service activity. You may receive messages related to active service requests, upcoming appointments, or follow-up communications as needed.
                </p>
              </Subsection>

              <Subsection title="4.4 Message and Data Rates">
                <p>
                  <strong>Message and data rates may apply.</strong> Contact your wireless carrier for information about your plan&apos;s rates.
                </p>
              </Subsection>

              <Subsection title="4.5 How to Opt Out">
                <p>
                  You may opt out of SMS messages at any time by replying <strong>STOP</strong> to any message from us. After opting out, you will receive a single confirmation message. You will not receive further SMS messages unless you opt in again.
                </p>
                <p>
                  You may also opt out by contacting us at <strong>{EMAIL}</strong> or <strong>{PHONE}</strong>.
                </p>
              </Subsection>

              <Subsection title="4.6 Help">
                <p>
                  For help with our SMS program, reply <strong>HELP</strong> to any of our messages, or contact us at <strong>{EMAIL}</strong>.
                </p>
              </Subsection>
            </Section>

            <Section title="5. How We Share Your Information">
              <p>
                We do not sell your personal information. We may share your information only in the following limited circumstances:
              </p>
              <ul>
                <li>
                  <strong>Service Providers:</strong> We may share information with trusted third-party vendors who assist us in operating our business (e.g., CRM software, email delivery, scheduling tools, payment processors). These providers are contractually required to protect your information and use it only as directed by us.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests from public authorities (e.g., court orders, government agencies).
                </li>
                <li>
                  <strong>Business Transfers:</strong> If Bandit Recycling is involved in a merger, acquisition, or sale of all or a portion of its assets, your information may be transferred as part of that transaction.
                </li>
                <li>
                  <strong>Protection of Rights:</strong> We may disclose information to protect the rights, property, or safety of Bandit Recycling, our customers, or others.
                </li>
              </ul>
              <p>
                <strong>We do not share your personal information with third parties for their own marketing or advertising purposes.</strong>
              </p>
            </Section>

            <Section title="6. Cookies and Tracking Technologies">
              <p>
                Our Site uses cookies and similar tracking technologies to analyze usage, improve performance, and support advertising. Cookies are small text files stored on your device. You can control cookies through your browser settings; however, disabling cookies may affect certain Site functionality.
              </p>
              <p>
                We may use analytics services (such as Google Analytics) and advertising platforms (such as Google Ads) that collect information about your visits to our Site and other websites. These services have their own privacy policies governing their use of information.
              </p>
            </Section>

            <Section title="7. Data Retention">
              <p>
                We retain your personal information for as long as necessary to provide services to you, comply with legal obligations, resolve disputes, and enforce our agreements. When your information is no longer needed for these purposes, we will delete or anonymize it in accordance with our data retention practices.
              </p>
              <p>
                SMS opt-in data is retained while you are an active subscriber and for a reasonable period after opt-out, as required for legal compliance and record-keeping purposes.
              </p>
            </Section>

            <Section title="8. Data Security">
              <p>
                We implement reasonable and appropriate technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                Our Site and services are intended for business use and are directed to adults. We do not knowingly collect personal information from individuals under the age of 18. If we become aware that we have collected information from a minor, we will take steps to delete it promptly.
              </p>
            </Section>

            <Section title="10. Your Rights and Choices">
              <p>Depending on your location, you may have certain rights with respect to your personal information, including:</p>
              <ul>
                <li>The right to access the personal information we hold about you</li>
                <li>The right to correct inaccurate or incomplete information</li>
                <li>The right to request deletion of your personal information (subject to legal obligations)</li>
                <li>The right to opt out of SMS communications at any time (reply STOP)</li>
                <li>The right to withdraw consent where processing is based on consent</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at <strong>{EMAIL}</strong> or <strong>{PHONE}</strong>. We will respond to your request within a reasonable timeframe and in accordance with applicable law.
              </p>
            </Section>

            <Section title="11. Third-Party Links">
              <p>
                Our Site may contain links to third-party websites. This Privacy Policy does not apply to those sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </Section>

            <Section title="12. Changes to This Privacy Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will post the revised Policy on our Site with an updated effective date. Your continued use of our Site or services after any changes constitutes acceptance of the revised Policy.
              </p>
            </Section>

            <Section title="13. Contact Us">
              <p>If you have questions, concerns, or requests related to this Privacy Policy or your personal information, please contact us:</p>
              <div className="mt-4 p-4 bg-[#111111] border border-[#1F2937] rounded-xl">
                <p className="text-white font-semibold">{COMPANY}</p>
                <p>Phone: <a href="tel:+18004226348" className="text-[#39FF14] hover:underline">{PHONE}</a></p>
                <p>Email: <a href={`mailto:${EMAIL}`} className="text-[#39FF14] hover:underline">{EMAIL}</a></p>
                <p>Website: <a href={WEBSITE} className="text-[#39FF14] hover:underline">{WEBSITE}</a></p>
              </div>
            </Section>

          </div>

          <div className="mt-12 pt-8 border-t border-[#1F2937] flex items-center gap-4">
            <Link href="/terms" className="text-sm text-[#39FF14] hover:underline">Terms of Service</Link>
            <span className="text-gray-600">·</span>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-[#1F2937]">{title}</h2>
      <div className="space-y-3 text-gray-400 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1.5">{children}</div>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 ml-4 pl-4 border-l border-[#39FF14]/20">
      <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
      <div className="space-y-2 text-gray-400 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
