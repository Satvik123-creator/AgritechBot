import React from 'react';
import { motion } from 'framer-motion';

export default function AppShowcase() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-surface-container-low relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
        <h2 className="text-5xl font-headline font-bold text-center mb-16 text-primary">The entire farm in your pocket.</h2>
        
        <div className="relative w-full max-w-4xl bg-surface-container-lowest rounded-[3rem] p-12 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-12 items-center">
          
          <div className="md:w-1/2 space-y-6 z-10">
            <h3 className="text-3xl font-bold text-primary">Voice-first design.</h3>
            <p className="text-on-surface-variant leading-relaxed">
              We know you have your hands dirty. That's why every feature of Anaaj.ai is accessible via voice commands. Just double-tap anywhere to talk.
            </p>
            <div className="flex gap-4">
              <div className="p-4 bg-surface rounded-2xl border border-outline-variant/10 text-on-surface">
                <span className="material-symbols-outlined text-tertiary-fixed text-3xl mb-2">offline_pin</span>
                <p className="text-sm font-bold">Offline Support</p>
              </div>
              <div className="p-4 bg-surface rounded-2xl border border-outline-variant/10 text-on-surface">
                <span className="material-symbols-outlined text-tertiary-fixed text-3xl mb-2">security</span>
                <p className="text-sm font-bold">Data Privacy</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 relative flex justify-center z-10">
            <div className="w-[65vw] h-auto md:w-64 md:h-[500px] bg-primary rounded-[2.5rem] p-3 shadow-xl transform rotate-3 relative z-10 aspect-[9/19.5]">
              <img 
                className="w-full h-full object-cover rounded-[2rem]" 
                alt="a smartphone screen displaying a vibrant farm management app interface with green charts and crop icons" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVHDJb6H3s3NMg43E50dYRBpXGyg1otbaWRAQUVg4f56FDjqn6aoaI7lD5pHX9e4iC6M1GZyZfX8H-LijPiP9dIfZD6Qq9O_SU5qM_bREsMNG6eaHvmVER6Ozj8MaNdt3ohWvTm9bSF_0FcBjVVztA26AjOY8p90G9XXE8IZMQMLaoEmxTA2MFDfvGwOQBiXAmE0c3oc_MSEYphiUuKn9P618Y0sd5RNZqFPNU0DacVLcZ4lFlfZI1vHLqkISKz2AYlxjRJVucdcds"
              />
            </div>
            <div className="absolute -z-10 w-full h-full bg-tertiary-fixed/20 blur-3xl rounded-full"></div>
          </div>
          
        </div>
      </div>
    </motion.section>
  );
}
