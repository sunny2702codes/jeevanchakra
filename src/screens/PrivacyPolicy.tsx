import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps { navigate: (s: string) => void; }

export default function PrivacyPolicy({ navigate }: PrivacyPolicyProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Legal</div>
          <h1 className="text-xl font-bold text-white">Privacy Policy and Data Usage Notice</h1>
          <p className="text-white/70 text-sm mt-1">
            JeevanChakra - Classical Homeopathy Decision Support System
          </p>
        </div>
      </div>

      <div className="jc-card space-y-6 text-sm text-slate-700 leading-relaxed">

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">1. About This Document</h2>
          <p>
            This Privacy Policy is issued by JeevanChakra in compliance with the Digital Personal Data Protection Act 2023 (DPDP Act). It explains what personal data we collect, why we collect it, how we use it, and your rights as a data principal.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">2. What We Collect</h2>
          <p className="mb-2">We collect the following categories of personal data when you use JeevanChakra:</p>
          <ul className="space-y-1 pl-4 list-disc">
            <li>Name and date of birth</li>
            <li>Mobile number</li>
            <li>City of residence</li>
            <li>Gender</li>
            <li>Medical complaints described during the assessment</li>
            <li>Emotional and mental state profile</li>
            <li>Constitutional traits and thermal characteristics</li>
            <li>Lifestyle and dietary preferences</li>
            <li>Health history as provided during intake</li>
          </ul>
          <p className="mt-2 text-slate-500 text-xs">
            This information constitutes personal data under the DPDP Act 2023 and is treated with due care given its health-related nature.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">3. Purpose of Processing</h2>
          <p>Your data is collected and used exclusively for the following purpose:</p>
          <p className="mt-2 pl-4 border-l-2 border-jc-purple-200 text-slate-600">
            To provide classical homeopathy decision support by matching your symptom patterns against a repertory of 700 remedies grounded in Boericke Materia Medica and Kent Repertory. This is a reference tool, not a diagnostic or treatment service.
          </p>
          <p className="mt-2">We do not use your data for advertising, profiling for commercial purposes, or sharing with third parties.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">4. Important Disclaimer</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
            <p className="font-semibold mb-1">JeevanChakra is a decision support tool, not a medical device.</p>
            <p>
              The system identifies symptom patterns that resemble established homeopathic remedy pictures. It does not provide a medical diagnosis, prescribe treatment, or replace the judgment of a qualified homeopathic practitioner. Always consult a registered homeopathic physician before taking any remedy.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">5. Data Storage and Security</h2>
          <ul className="space-y-1 pl-4 list-disc">
            <li>All data is stored on servers located in India (AWS ap-south-1, Mumbai region)</li>
            <li>Data is transmitted over encrypted connections (TLS 1.3)</li>
            <li>Assessment data is stored locally in your browser (localStorage) on your device</li>
            <li>We do not transmit your health assessment data to external servers</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">6. Your Rights Under DPDP Act 2023</h2>
          <p className="mb-3">As a data principal, you have the following rights:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Right to Access', desc: 'Request a copy of your personal data held by us.' },
              { title: 'Right to Correction', desc: 'Request correction of inaccurate personal data.' },
              { title: 'Right to Erasure', desc: 'Request deletion of your account and all associated data.' },
              { title: 'Right to Withdraw Consent', desc: 'Withdraw your consent at any time. This will result in cessation of services.' },
              { title: 'Right to Grievance Redressal', desc: 'Raise a complaint through our grievance mechanism.' },
              { title: 'Right to Nominate', desc: 'Nominate another individual to exercise your rights in the event of death or incapacity.' },
            ].map(r => (
              <div key={r.title} className="bg-slate-50 rounded-xl p-3">
                <p className="font-semibold text-slate-800 text-xs mb-1">{r.title}</p>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">7. Data Retention</h2>
          <p>
            Your assessment data is retained for as long as your account is active or as needed to provide the service. You may delete your account and all associated data at any time. Account data is retained for a maximum of 3 years from last active use, after which it is purged.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">8. Age Restriction</h2>
          <p>
            JeevanChakra is available to users who are 18 years of age or older. We do not knowingly collect personal data from minors. If you believe a minor has registered, please contact our Grievance Officer.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">9. Grievance Officer</h2>
          <div className="bg-jc-purple-50 border border-jc-purple-100 rounded-xl p-4">
            <p className="text-slate-700">For any data privacy concerns or to exercise your rights, contact our Grievance Officer:</p>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <p><span className="font-semibold">Name:</span> Mounik Pani</p>
              <p><span className="font-semibold">Organization:</span> JeevanChakra</p>
              <p><span className="font-semibold">Email:</span> grievance@jeevanchakra.in</p>
              <p><span className="font-semibold">Response Time:</span> Within 48 hours of receipt</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">10. Governing Law</h2>
          <p>
            This Privacy Policy is governed by the laws of India, including the Digital Personal Data Protection Act 2023, the Information Technology Act 2000, and applicable rules thereunder.
          </p>
        </section>

        <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
          Last updated: July 2026. Version 1.0.
        </div>
      </div>

      <button className="jc-btn-ghost flex items-center gap-2" onClick={() => navigate('home')}>
        <ArrowLeft size={16} /> Back to Home
      </button>
    </div>
  );
}
