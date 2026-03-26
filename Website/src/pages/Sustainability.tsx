import React from 'react';
import { motion } from 'framer-motion';

export default function Sustainability() {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-fixed w-fit mb-8 shadow-sm">
            <span className="material-symbols-outlined text-sm">eco</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">Sustainability Report 2026</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-bold text-primary tracking-tight leading-[1] mb-8">
            Growing a Greener <span className="italic text-tertiary-fixed-variant">Future.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-body leading-relaxed max-w-3xl mx-auto">
            At Anaaj.ai, sustainability isn't a buzzword—it's our operational core. We help farmers minimize chemical usage and maximize natural output.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { label: 'Chemical Reduction', value: '40%', icon: 'science' },
            { label: 'Water Saved', value: '25B Liters', icon: 'water_drop' },
            { label: 'Farmers Impacted', value: '500K+', icon: 'agriculture' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 bg-primary-container text-on-primary rounded-[3rem] text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 pointer-events-none">
                <span className="material-symbols-outlined text-[200px]">{stat.icon}</span>
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-headline font-bold text-tertiary-fixed mb-2">{stat.value}</div>
                <div className="text-sm font-bold uppercase tracking-widest opacity-80">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-headline font-bold text-primary leading-tight">Precision for the planet.</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Standard agricultural methods often involve broad-spectrum chemical spraying and over-irrigation. Anaaj.ai provides localized diagnostic intelligence that tells farmers exactly when, where, and how much treatment is needed.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-tertiary-fixed-variant">forest</span>
                <div>
                  <h4 className="font-bold text-primary">Soil Health Preservation</h4>
                  <p className="text-sm text-on-surface-variant">Preventing nutrient depletion through precise crop rotation advice.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-tertiary-fixed-variant">energy_savings_leaf</span>
                <div>
                  <h4 className="font-bold text-primary">Resource Optimization</h4>
                  <p className="text-sm text-on-surface-variant">Reducing electricity and fuel waste by optimizing irrigation timing.</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1592982537447-6f296b0f0b4a?q=80&w=1200&auto=format&fit=crop" 
              alt="Farmer checking soil" 
              className="rounded-[3rem] shadow-2xl"
            />
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-outline-variant/10 max-w-xs">
              <p className="italic text-primary font-medium">"My land feels alive again. The soil is darker and richer since I started using Anaaj's advice."</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-4 text-on-surface-variant">— GURPREET S., PUNJAB</p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
