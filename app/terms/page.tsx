import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Bandit Recycling",
  description: "Terms of Service for Bandit Recycling, including SMS messaging terms, service agreements, and usage policies.",
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "April 4, 2026";
const COMPANY = "Bandit Recycling LLC";
const WEBSITE = "https://banditrecycling.com";
const EMAIL = "service@banditrecycling.com";
const PHONE = "1-800-BANDIT-1";

export default function TermsPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* Header */}
      <div className="bg-[#050505] border-b border-[#1F2937] py-12">
        <div className="container-site">
          <div className="badge-green mb-4">Legal</div>
          <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-site py-16">
        <div className="max-w-3xl">
          <div className="prose-legal">

            <Section title="1. Agreement to Terms">
              <p>
                By accessing or using the website located at <strong>{WEBSITE}</strong> (the &ldquo;Site&rdquo;), contacting us by phone, submitting a form, or engaging our services, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use our Site or services.
              </p>
              <p>
                These Terms apply to all visitors, leads, customers, and others who access or use the services of {COMPANY} (&ldquo;Bandit,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
              </p>
            </Section>

            <Section title="2. Services">
              <p>
                Bandit Recycling provides baler repair and maintenance services, equipment sales and leasing, bale wire supply, and related recycling industry services in the Southeast United States. Specific terms applicable to individual service agreements will be set forth in separate written contracts or service orders.
              </p>
            </Section>

            <Section title="3. SMS / Text Message Communications">
              <p>
                By providing your mobile phone number and submitting a quote request, contact form, or otherwise opting in to receive text messages from Bandit Recycling, you consent to receive recurring automated and non-automated SMS text messages from us at the mobile number provided, including messages sent via an automatic telephone dialing system.
              </p>

              <Subsection title="3.1 Types of Messages">
                <p>Bandit Recycling may send you SMS messages related to:</p>
                <ul>
                  <li>Responses to service and quote requests you have submitted</li>
                  <li>Appointment confirmations, reminders, and technician dispatch notifications</li>
                  <li>Service updates and status notifications for active repair or maintenance orders</li>
                  <li>Follow-up communications regarding your baler equipment or service history</li>
                  <li>Important account or billing notifications</li>
                </ul>
                <p>
                  Message frequency will vary based on the nature of your service request and active orders. Standard transactional and service-related messages may be sent as needed.
                </p>
              </Subsection>

              <Subsection title="3.2 Message and Data Rates">
                <p>
                  <strong>Message and data rates may apply.</strong> Check with your mobile carrier for applicable rates. Bandit Recycling is not responsible for any charges applied by your mobile carrier.
                </p>
              </Subsection>

              <Subsection title="3.3 How to Opt Out">
                <p>
                  You may opt out of receiving SMS messages from Bandit Recycling at any time by replying <strong>STOP</strong> to any text message you receive from us. After sending STOP, you will receive a one-time confirmation message and will no longer receive SMS messages from Bandit Recycling, except as required by law.
                </p>
                <p>
                  You may also opt out by emailing us at <strong>{EMAIL}</strong> or calling <strong>{PHONE}</strong> and requesting removal from our SMS communications.
                </p>
              </Subsection>

              <Subsection title="3.4 Help">
                <p>
                  For help or information about our SMS program, reply <strong>HELP</strong> to any message you receive from us, or contact us at <strong>{EMAIL}</strong> or <strong>{PHONE}</strong>.
                </p>
              </Subsection>

              <Subsection title="3.5 Consent Not Required for Purchase">
                <p>
                  Consent to receive SMS messages is not a condition of purchasing any goods or services from Bandit Recycling. You may contact us by phone or email without providing SMS consent.
                </p>
              </Subsection>

              <Subsection title="3.6 Supported Carriers">
                <p>
                  Our SMS messaging program is supported by most major US wireless carriers. Carriers are not liable for delayed or undelivered messages.
                </p>
              </Subsection>
            </Section>

            <Section title="4. Quotes and Pricing">
              <p>
                All quotes provided through our website, by phone, or by email are estimates only and are subject to change based on on-site inspection, parts availability, and the actual scope of work required. A final price will be confirmed in writing before any work is performed. Bandit Recycling reserves the right to modify pricing without notice for services not yet confirmed.
              </p>
            </Section>

            <Section title="5. Intellectual Property">
              <p>
                All content on this Site, including text, graphics, logos, images, and software, is the property of {COMPANY} or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on this Site without our express written permission.
              </p>
            </Section>

            <Section title="6. Disclaimer of Warranties">
              <p>
                THE SITE AND SERVICES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. BANDIT RECYCLING DOES NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
            </Section>

            <Section title="7. Limitation of Liability">
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, {COMPANY.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST REVENUE, LOSS OF DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE OR OUR SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p>
                OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM OR RELATING TO THESE TERMS OR OUR SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID US FOR THE SPECIFIC SERVICE GIVING RISE TO THE CLAIM IN THE THREE (3) MONTHS PRECEDING THE CLAIM.
              </p>
            </Section>

            <Section title="8. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless {COMPANY}, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys&apos; fees, arising out of or in any way connected with your access to or use of the Site or our services, or your violation of these Terms.
              </p>
            </Section>

            <Section title="9. Third-Party Links">
              <p>
                Our Site may contain links to third-party websites. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.
              </p>
            </Section>

            <Section title="10. Governing Law and Disputes">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, without regard to its conflict of law provisions. Any dispute arising under or relating to these Terms or our services shall be resolved exclusively in the state or federal courts located in Georgia. You consent to the personal jurisdiction of such courts.
              </p>
            </Section>

            <Section title="11. Changes to These Terms">
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site or our services after any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.
              </p>
            </Section>

            <Section title="12. Contact Us">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <div className="mt-4 p-4 bg-[#111111] border border-[#1F2937] rounded-xl">
                <p className="text-white font-semibold">{COMPANY}</p>
                <p>Phone: <a href="tel:+18002263481" className="text-[#39FF14] hover:underline">{PHONE}</a></p>
                <p>Email: <a href={`mailto:${EMAIL}`} className="text-[#39FF14] hover:underline">{EMAIL}</a></p>
                <p>Website: <a href={WEBSITE} className="text-[#39FF14] hover:underline">{WEBSITE}</a></p>
              </div>
            </Section>

          </div>

          <div className="mt-12 pt-8 border-t border-[#1F2937] flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-[#39FF14] hover:underline">Privacy Policy</Link>
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
      <div className="space-y-3 text-gray-400 text-sm leading-relaxed">{children}</div>
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
