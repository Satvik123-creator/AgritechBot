import React from 'react';
import { motion } from 'framer-motion';

export default function LiveChat() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-surface"
    >
      <div className="max-w-7xl mx-auto px-8 editorial-grid">
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-center space-y-6">
          <h2 className="text-4xl font-headline font-bold text-primary">Speaks Your Language</h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Whether it's Hindi, Gujarati, or Punjabi, Anaaj.ai understands local dialects and context. Just speak naturally, and get instant answers.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">हिंदी (Hindi)</span>
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">ગુજરાતી (Gujarati)</span>
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">ਪੰਜਾਬੀ (Punjabi)</span>
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">+ 12 more</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-[2.5rem] p-12 relative overflow-hidden">
          <div className="space-y-8 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl rounded-tl-none shadow-sm max-w-md">
                <p className="text-on-surface font-medium italic">"મારી મગફળીના પાંદડા કેમ પીળા પડે છે?" (Why are my groundnut leaves turning yellow?)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="bg-primary-container text-on-primary p-6 rounded-3xl rounded-tr-none shadow-xl max-w-md">
                <p className="leading-relaxed">This could be Nitrogen deficiency or waterlogging. I see you had heavy rain yesterday. Try draining the excess water first.</p>
                <div className="mt-4 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed"></div>
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed opacity-60"></div>
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed opacity-30"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 opacity-10">
            <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'wght' 100" }}>graphic_eq</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
