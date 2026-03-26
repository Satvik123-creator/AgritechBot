import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-headline font-bold text-primary mb-4">Terms of Service</h1>
          <p className="text-on-surface-variant font-medium uppercase tracking-widest text-sm">Effective Date: March 2026</p>
        </motion.div>

        <div className="space-y-12 text-on-surface font-body leading-relaxed">
          <section>
            <h2 className="text-2xl font-headline font-bold text-primary mb-4 underline decoration-tertiary-fixed decoration-4 underline-offset-4">1. Acceptance of Terms</h2>
            <p>By accessing or using the Anaaj.ai website or mobile application, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold text-primary mb-4 underline decoration-tertiary-fixed decoration-4 underline-offset-4">2. Nature of Advisory Service</h2>
            <p>Anaaj.ai provides agricultural advice based on AI models, satellite data, and user input. While we strive for extreme accuracy, our advice is provided "as is". Agricultural outcomes depend on many factors beyond our control, including extreme weather and implementation methods. We are not liable for any crop results or financial losses.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold text-primary mb-4 underline decoration-tertiary-fixed decoration-4 underline-offset-4">3. User Responsibilities</h2>
            <p>You are responsible for the accuracy of the information you provide (such as crop type and location). You agree to use the service only for lawful agricultural purposes and not to attempt to reverse engineer or disrupt the AI systems.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold text-primary mb-4 underline decoration-tertiary-fixed decoration-4 underline-offset-4">4. Intellectual Property</h2>
            <p>All software, brand names, and logos associated with Anaaj.ai are the property of Anaaj.ai Precision Ltd. You are granted a limited, non-exclusive license to use the service for personal or commercial agricultural use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold text-primary mb-4 underline decoration-tertiary-fixed decoration-4 underline-offset-4">5. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities that threaten the integrity of our advisory models.</p>
          </section>

          <div className="mt-16 pt-8 border-t border-outline-variant/10 text-on-surface-variant text-sm text-center">
            <p>© 2026 Anaaj.ai Precision Ltd. All Rights Reserved.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
