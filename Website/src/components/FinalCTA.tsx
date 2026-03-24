import React from 'react';
import { motion } from 'framer-motion';
import { HoleBackground } from './ui/hole-background';

export default function FinalCTA() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 px-8 bg-surface relative"
    >
      <div className="max-w-7xl mx-auto rounded-[3rem] bg-[#0c2b18] p-16 md:p-24 text-center text-on-primary relative overflow-hidden shadow-2xl border border-primary/20">
        
        {/* Animated Hole Background Component */}
        <HoleBackground 
          strokeColor="rgba(255, 255, 255, 0.4)" 
          particleRGBColor={[150, 255, 100]}
          numberOfLines={40}
          numberOfDiscs={24}
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-headline font-bold tracking-tight">Your harvest, <br/>our intelligence.</h2>
          <p className="text-xl opacity-80 leading-relaxed font-body">Join over 500,000 farmers who are making smarter decisions and earning more with Anaaj.ai. Download now and transform your farm.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="bg-tertiary-fixed text-on-tertiary-fixed px-10 py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg">
              <span className="material-symbols-outlined">download</span>
              Get for Android
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/20 transition-all shadow-lg">
              Talk to an Agent
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
