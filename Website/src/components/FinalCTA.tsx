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
      <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[3rem] bg-[#0c2b18] p-8 sm:p-12 md:p-24 text-center text-on-primary relative overflow-hidden shadow-2xl border border-primary/20">
        
        {/* Animated Hole Background Component */}
        <HoleBackground 
          strokeColor="rgba(255, 255, 255, 0.4)" 
          particleRGBColor={[150, 255, 100]}
          numberOfLines={40}
          numberOfDiscs={24}
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-headline font-bold tracking-tight">Your harvest, <br/>our intelligence.</h2>
          <p className="text-xl opacity-80 leading-relaxed font-body">Join over 500,000 farmers who are making smarter decisions and earning more with Anaaj.ai. Download now and transform your farm.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a href="https://expo.dev/artifacts/eas/5Y55N8DQD7briRjoqYhucp.apk" download className="bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 md:px-10 md:py-5 rounded-2xl text-lg md:text-xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg w-full sm:w-auto">
              <span className="material-symbols-outlined">download</span>
              Get for Android
            </a>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-4 md:px-10 md:py-5 rounded-2xl text-lg md:text-xl font-bold hover:bg-white/20 transition-all shadow-lg w-full sm:w-auto flex justify-center items-center">
              Talk to an Agent
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
