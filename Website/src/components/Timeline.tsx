import React from 'react';
import { motion } from 'framer-motion';

export default function Timeline() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-surface relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <h2 className="text-5xl font-headline font-bold text-center mb-24 text-primary">Simple as a conversation.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          {/* Connective line */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-outline-variant/30 -z-10"></div>
          
          <div className="flex flex-col items-center text-center space-y-6 group text-on-surface">
            <div className="w-24 h-24 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline-variant/20 shadow-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">voice_selection</span>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Ask</h4>
              <p className="text-sm text-on-surface-variant">Speak or type your problem in your local language.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6 group text-on-surface">
            <div className="w-24 h-24 rounded-full bg-tertiary-container flex items-center justify-center border border-tertiary-fixed shadow-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary-fixed text-4xl">neurology</span>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Understand</h4>
              <p className="text-sm text-on-surface-variant">AI analyzes crop history, weather, and satellite data.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6 group text-on-surface">
            <div className="w-24 h-24 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline-variant/20 shadow-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">lightbulb</span>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Advice</h4>
              <p className="text-sm text-on-surface-variant">Get instant, actionable steps with dosage and timing.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6 group text-on-surface">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>potted_plant</span>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Thrive</h4>
              <p className="text-sm text-on-surface-variant">Watch your yield increase and costs decrease.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
