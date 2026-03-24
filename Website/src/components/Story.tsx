import React from 'react';
import { motion } from 'framer-motion';

export default function Story() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-primary text-on-primary overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="max-w-3xl mb-24">
          <h2 className="text-5xl font-headline font-bold mb-8 leading-tight">
            Expert knowledge used to be expensive and miles away.
          </h2>
          <p className="text-2xl text-on-primary-container font-body leading-relaxed">
            Most farmers lack access to real-time agronomists. We built Anaaj.ai to ensure no crop fails due to lack of information.
          </p>
        </div>
        
        <div className="relative rounded-[2.5rem] overflow-hidden aspect-[21/9] group">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none" 
            src="/Section2Video.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80"></div>
          <div className="absolute bottom-12 left-12 max-w-lg">
            <p className="text-3xl font-headline font-bold">"I finally have an expert in my pocket who speaks my language."</p>
            <p className="mt-4 text-on-primary-container font-label uppercase tracking-widest">— RAMESH K., PUNJAB</p>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
