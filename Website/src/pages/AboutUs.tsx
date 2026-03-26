import React from 'react';
import { motion } from 'framer-motion';

export default function AboutUs() {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container w-fit mb-8 shadow-sm">
            <span className="material-symbols-outlined text-sm">groups</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-bold text-primary tracking-tight leading-[1] mb-8">
            Empowering those who <span className="italic text-tertiary-fixed-variant">feed the world.</span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant font-body leading-relaxed">
            Anaaj.ai was born out of a simple observation: while technology is advancing rapidly, the world's most critical workers—our farmers—are often left behind. We're bridging that gap with professional, multilingual AI.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-[3rem] bg-surface-container-highest flex flex-col justify-center"
          >
            <h2 className="text-3xl font-headline font-bold text-primary mb-6">Our Mission</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              To democratize expert agricultural knowledge through voice-first technology. We believe every farmer, regardless of literacy or language, deserves access to precision agronomy and real-time market data.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-[3rem] bg-primary text-on-primary flex flex-col justify-center shadow-2xl"
          >
            <h2 className="text-3xl font-headline font-bold text-tertiary-fixed mb-6">Our Vision</h2>
            <p className="text-lg opacity-80 leading-relaxed">
              A future where agriculture is both sustainable and highly profitable. Where a farmer's decision is backed by satellite insights and climate data, leading to zero crop failure and global food security.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-32">
          <h2 className="text-4xl font-headline font-bold text-primary mb-16 text-center">Guided by Intelligence.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'language', title: 'Multilingual First', desc: 'We speak the language of the farmer, ensuring technology is never a barrier.' },
              { icon: 'science', title: 'Data Driven', desc: 'Every piece of advice is backed by rigorous scientific research and local data.' },
              { icon: 'psychology_alt', title: 'Human Centric', desc: 'Our AI is designed to augment human expertise, not replace the farmer.' },
              { icon: 'eco', title: 'Sustainable', desc: 'We promote farming techniques that preserve the soil for generations to come.' },
              { icon: 'security', title: 'Secure & Private', desc: 'A farmer\'s data is their own. We protect and encrypt all localized insights.' },
              { icon: 'verified', title: 'Actionable', desc: 'We don\'t just provide data; we provide clear, executable steps to improve yields.' }
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed-dim text-on-primary-fixed-variant flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
