import React from 'react';
import { motion } from 'framer-motion';
import { FlipCard } from './ui/flip-card';
import { vendors } from '../data/vendors';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }} 
      whileInView={{ opacity: 1, scale: 1 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.7 }} 
      className="py-32 bg-surface-container overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8 mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit mb-6">
            <span className="material-symbols-outlined text-sm">storefront</span>
            <span className="text-xs font-bold uppercase tracking-widest">Marketplace</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-headline font-bold text-primary max-w-2xl leading-tight">
            Top Featured Vendors
          </h2>
        </div>
        <button className="flex items-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-2xl font-bold hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap">
          View All Sellers
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      
      {/* Horizontal snap-scrolling viewport */}
      <div className="flex gap-8 px-8 overflow-x-auto pb-12 overflow-y-visible no-scrollbar snap-x snap-mandatory pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-[max(2rem,calc((100vw-80rem)/2+2rem))] pt-8 -mt-8">
        {vendors.map((vendor) => (
          <Link 
            key={vendor.id} 
            to={`/vendor/${vendor.id}`} 
            className="snap-center shrink-0 transition-transform hover:scale-[1.02]"
          >
            <FlipCard data={vendor} />
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
