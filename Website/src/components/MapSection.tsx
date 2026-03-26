import React from 'react';
import { motion } from 'framer-motion';

export default function MapSection() {
  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:w-1/3 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container w-fit mb-2 shadow-sm">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="text-xs font-bold uppercase tracking-widest font-label">Our Presence</span>
            </div>
            
            <h2 className="text-5xl font-headline font-bold text-primary leading-tight">
              Rooted in Punjab, <span className="italic text-tertiary-fixed-variant">Growing Globally.</span>
            </h2>
            
            <p className="text-lg text-on-surface-variant leading-relaxed">
              Our headquarters at the Agro-Tech Hub is the nerve center of Anaaj.ai, coordinating with thousands of local data nodes across the agricultural heartlands of India.
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Innovation HQ', desc: 'Sector 82, Mohali, Punjab' },
                { title: 'Training Center', desc: 'Agricultural University Road, Ludhiana' },
                { title: 'Data Nodes', desc: 'Active in 40+ districts across 4 states' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 h-auto bg-primary rounded-full"></div>
                  <div>
                    <h4 className="font-bold text-primary">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Map Image/Iframe Container */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/3 w-full h-[500px] relative rounded-[3rem] overflow-hidden shadow-2xl border border-outline-variant/10 group"
          >
            {/* Using a styled iframe with a subtle green-tint filter to match the brand */}
            <iframe 
              title="Map"
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Sector%2082,%20Mohali,%20Punjab,%20India+(Anaaj.ai%20HQ)&t=&z=14&ie=UTF8&iwloc=B&output=embed"
              style={{ filter: 'grayscale(0.8) contrast(1.2) opacity(0.8) hue-rotate(100deg)' }}
              className="group-hover:grayscale-0 transition-all duration-700"
            >
            </iframe>
            
            {/* Glass Card Overlay */}
            <div className="absolute bottom-8 right-8 bg-surface-container-lowest/80 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl max-w-xs transition-transform group-hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest font-label">Status: Active</span>
              </div>
              <p className="text-sm font-medium text-on-surface">Agro-Tech Hub, Level 4, Sector 82, Mohali, Punjab 140308</p>
            </div>
          </motion.div>
          
        </div>
        
      </div>
    </section>
  );
}
