import React from 'react';
import { motion } from 'framer-motion';

export default function PricingFAQ() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-surface"
    >
      <div className="max-w-7xl mx-auto px-8 editorial-grid">
        
        {/* Pricing */}
        <div className="col-span-12 lg:col-span-4 mb-12">
          <h2 className="text-4xl font-headline font-bold mb-6 text-primary">Simple Pricing.</h2>
          <p className="text-on-surface-variant mb-8">Choose a plan that fits your farm's scale. No hidden fees.</p>
          
          <div className="p-8 bg-primary text-on-primary rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-tighter">Popular</div>
            <h3 className="text-xl font-bold mb-2">Pro Farmer</h3>
            <div className="text-4xl font-headline font-bold mb-6">₹149<span className="text-sm opacity-60 font-body">/month</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-sm">check</span>
                Unlimited Voice Queries
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-sm">check</span>
                Advanced Pest Diagnosis
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-sm">check</span>
                Personalized Market Price Alerts
              </li>
            </ul>
            <button className="w-full bg-tertiary-fixed text-on-tertiary-fixed py-3 rounded-xl font-bold hover:scale-105 transition-transform">Get Started</button>
          </div>
        </div>
        
        {/* FAQ */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-6 text-on-surface">
          <h2 className="text-3xl font-headline font-bold mb-12 text-primary">Common Questions</h2>
          <div className="space-y-4 text-on-surface">
            
            <div className="group border-b border-outline-variant py-6 cursor-pointer">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">Does it work without internet?</h4>
                <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">add</span>
              </div>
              <p className="hidden group-hover:block mt-4 text-on-surface-variant leading-relaxed">
                Yes, Anaaj.ai supports offline caching for weather and basic advisory tips. Voice interactions require a basic 2G connection for cloud processing.
              </p>
            </div>
            
            <div className="group border-b border-outline-variant py-6 cursor-pointer">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">Is my data safe?</h4>
                <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">add</span>
              </div>
              <p className="hidden group-hover:block mt-4 text-on-surface-variant leading-relaxed">
                Absolutely. We never sell farmer data to third parties. Your soil history is encrypted and used only to provide better advice to you.
              </p>
            </div>
            
            <div className="group border-b border-outline-variant py-6 cursor-pointer">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">Which languages are supported?</h4>
                <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">add</span>
              </div>
              <p className="hidden group-hover:block mt-4 text-on-surface-variant leading-relaxed">
                We currently support Hindi, Gujarati, Punjabi, Marathi, Telugu, Tamil, and English. We are adding new languages every month.
              </p>
            </div>

          </div>
        </div>
        
      </div>
    </motion.section>
  );
}
