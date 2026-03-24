import React from 'react';
import { motion } from 'framer-motion';

export default function WeatherWidget() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-primary-container text-on-primary"
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="editorial-grid gap-8">
          <div className="col-span-12 lg:col-span-4 bg-primary p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-2xl font-bold">Ludhiana, PB</h3>
                <p className="opacity-70">Monday, 14 Oct</p>
              </div>
              <span className="material-symbols-outlined text-5xl text-tertiary-fixed">cloud_sync</span>
            </div>
            <div className="text-6xl font-headline font-bold mb-8">32°C</div>
            <div className="flex justify-between border-t border-white/10 pt-6">
              <div className="text-center">
                <p className="text-xs opacity-60 mb-1">Humidity</p>
                <p className="font-bold">64%</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-60 mb-1">Rain</p>
                <p className="font-bold">85%</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-60 mb-1">Wind</p>
                <p className="font-bold">12km/h</p>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low text-on-surface p-12 rounded-[2rem] flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="text-xs font-bold uppercase tracking-widest">AI ALERT</span>
              </div>
              <h3 className="text-4xl font-headline font-bold text-primary max-w-xl">Heavy rain expected in 4 hours. Avoid spraying fertilizer today.</h3>
              <p className="text-lg text-on-surface-variant max-w-lg">We’ve detected a high-probability storm cell. Save your inputs and wait for Wednesday morning for the best absorption window.</p>
              <div className="flex gap-4">
                <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Set Alert</button>
                <button className="border border-outline-variant px-6 py-3 rounded-xl font-bold hover:bg-surface-container-highest transition-colors">View Detail</button>
              </div>
            </div>
            
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[400px]" style={{ fontVariationSettings: "'wght' 100" }}>rainy</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
