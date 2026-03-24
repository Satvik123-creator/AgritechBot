import React from 'react';
import { motion } from 'framer-motion';

export default function Features() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-surface-container-lowest"
    >
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-center text-5xl font-headline font-bold mb-32 text-primary">Precision tools for every acre.</h2>
        
        {/* Feature 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-48">
          <div className="lg:w-1/2">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
              <img 
                className="w-full aspect-square object-cover" 
                alt="smartphone camera scanning a corn leaf with digital interface overlays showing disease detection polygons" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4AHeVkFi4xeFcJx9lyU-Af99_IwRuemXgL7SAuWNeqY6KuaD5vFjJ6mTm0Kr1fyPBMbhI3ccnLL5p0kuAEOzHOj-hgF3tdgNiDYVJ9MlTdURNbvmCwHvfcgKwkb4bRhLEiVa5ykP4yseB0Mdh385AV64lqhSEpe7_BMGjBL41adL1UUGYIFdO7lt1AIc8cFQ_kaSddfbPUOl8_FeBqSdhW_3hvErWx6vrPMyaXVK-zZBCdzf4YD6_CMnMgnutAVXQ8_FuzP6MsIVp"
              />
              <div className="absolute top-6 right-6 bg-tertiary-fixed text-on-tertiary-fixed px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">scan</span>
                98% Accuracy
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 space-y-6">
            <span className="text-on-primary-container font-label uppercase tracking-widest font-bold">Image Scanning</span>
            <h3 className="text-4xl font-headline font-bold leading-tight text-primary">Identify pests and diseases in seconds.</h3>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Take a photo of your leaf or crop. Our AI analyzes thousands of data points to identify issues instantly and suggest the exact cure.
            </p>
            <ul className="space-y-4 pt-4 text-on-surface">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Fungal & Bacterial detection</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Nutrient deficiency analysis</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative p-12 bg-surface-container rounded-[2rem] border border-outline-variant/20 overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                  <span className="font-label text-sm text-on-surface-variant tracking-wider">SOIL PH</span>
                  <div className="text-3xl font-bold text-primary mt-2">6.8</div>
                  <div className="text-xs text-lime-600 mt-1 font-semibold">Perfect Range</div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                  <span className="font-label text-sm text-on-surface-variant tracking-wider">MOISTURE</span>
                  <div className="text-3xl font-bold text-primary mt-2">42%</div>
                  <div className="text-xs text-secondary mt-1 font-semibold">Optimal</div>
                </div>
                <div className="col-span-2 bg-primary-container text-on-primary p-6 rounded-2xl shadow-xl mt-4 z-10 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-tertiary-fixed">smart_toy</span>
                    <span className="text-xs font-bold tracking-widest uppercase">Smart Recommendation</span>
                  </div>
                  <p className="text-sm font-medium">Add organic compost next week to maintain nitrogen levels before the sowing cycle.</p>
                </div>
              </div>
              {/* Blurred foliage behind */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl z-0"></div>
            </div>
          </div>
          <div className="lg:w-1/2 space-y-6">
            <span className="text-on-primary-container font-label uppercase tracking-widest font-bold">Smart Insights</span>
            <h3 className="text-4xl font-headline font-bold leading-tight text-primary">Data-driven decisions, simplified.</h3>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Anaaj.ai connects with your local climate data and soil history to provide recommendations that actually work for your specific land.
            </p>
            <button className="bg-surface-container-high px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-primary hover:bg-surface-container-highest transition-colors">
              Learn how we use data
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
