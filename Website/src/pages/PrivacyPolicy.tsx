import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-headline font-bold text-primary mb-4">Privacy Policy</h1>
          <p className="text-on-surface-variant font-medium uppercase tracking-widest text-sm">Last Updated: March 2026</p>
        </motion.div>

        <div className="space-y-12 text-on-surface font-body leading-relaxed prose prose-headings:font-headline prose-headings:text-primary">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Data Ownership</h2>
            <p>At Anaaj.ai, we operate on a fundamental principle: <strong>Your data belongs to you.</strong> We do not sell your personal information or agricultural data to third-party marketers. Your soil history, crop data, and voice recordings are used solely to provide more accurate agricultural advice to you.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information Collection</h2>
            <p>We collect information necessary to provide our services, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Profile data (name, phone number, location).</li>
              <li>Voice recordings (processed to understand your farming queries).</li>
              <li>Satellite and GPS data (to provide localized weather and soil insights).</li>
              <li>Crop health photos (used for pest and disease diagnosis).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
            <p>We use industry-standard encryption protocols (SSL/TLS) to protect your data during transmission and storage. Access to your personal data is restricted to authorized Anaaj.ai personnel who require it to provide support and technical improvements.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Sharing Information</h2>
            <p>We may share anonymous, aggregated data at a regional level (e.g., broad pest outbreak alerts) with government organizations to help prevent regional crop failures. This data is fully anonymized and cannot be linked back to individual farmers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p>You have the right to request a full copy of your data, or request the deletion of your account and all associated data at any time through our support portal or mobile app settings.</p>
          </section>

          <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/10 mt-12">
            <h3 className="font-bold text-primary mb-2">Questions?</h3>
            <p className="text-sm text-on-surface-variant">If you have any questions regarding your privacy, please contact us at <span className="font-bold">privacy@anaajai.com</span></p>
          </div>
        </div>

      </div>
    </div>
  );
}
