import React from 'react';
import { motion } from 'framer-motion';

export default function Marketplace() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-surface overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-8 mb-16">
        <div className="flex justify-between items-end">
          <h2 className="text-5xl font-headline font-bold text-primary">Recommended for your soil.</h2>
          <a className="text-primary font-bold flex items-center gap-2 underline decoration-tertiary-fixed decoration-4 underline-offset-4 hover:opacity-80 transition-opacity" href="#">
            Browse Marketplace
          </a>
        </div>
      </div>
      
      <div className="flex gap-8 px-8 overflow-x-auto pb-12 no-scrollbar pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {/* Product 1 */}
        <div className="min-w-[350px] bg-surface-container-lowest rounded-[2rem] p-6 shadow-sm border border-outline-variant/10 group cursor-pointer">
          <div className="aspect-square rounded-2xl overflow-hidden mb-6">
            <img 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="high quality organic vegetable seeds in minimalist eco-friendly packaging on a wooden surface" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcNmJmqMVOw0SJLuDU7wQpVHyJHbnhpbMX5SBBi6RSF8yDfN8Q0tZu7eVtrSyvtPaENmnysdR7gheFtdXNRxvaeF8a6TMhwAmdMgZLvMpAZcLeFLWviTksidXDMFreCZUge-Hq3AgGchLvl8N2e3rbRjRR_i8bwHRNNMH1NiENTcdzwycsQFnYJ5TzaMtkA2jgjEKX11dU1vPFJP-SmOi3vpsc4I6mJyKpd2rX7AUxO9SgC7AjP5zF0toVrXiaPXYDnjY5NdHPM0m-"
            />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xl font-bold text-on-surface">Bio-Potash 500g</h4>
              <p className="text-sm text-on-surface-variant">Recommended for: Potato</p>
            </div>
            <div className="bg-tertiary-container text-on-tertiary-fixed px-2 py-1 rounded text-xs font-bold">AI BEST CHOICE</div>
          </div>
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-2xl font-bold">₹499</span>
            <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          </div>
        </div>
        
        {/* Product 2 */}
        <div className="min-w-[350px] bg-surface-container-lowest rounded-[2rem] p-6 shadow-sm border border-outline-variant/10 group cursor-pointer">
          <div className="aspect-square rounded-2xl overflow-hidden mb-6">
            <img 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="high quality agricultural sprayer tool showing precision nozzle and high grade plastics" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcgogzVjSlUroMk7DV8vaD5hE1KYbUbJ14KMPzrOeb9tGq2UjYHkM58o2nlZgic3hIiRvXaVAruxSF8Z5SKL3rSA0CKCq0P0WReE2wN1-ziENbv4JnJ56uqV5uA47mc1P5BDnQRrGpQ_2LrmQz_AtyCb9rQi9BktptowBb8cVVBrtdYgvmVeE0ILI59I_Jx_WlEBvNfXEoVkgR5oH5IxVdAil2ZwMj7dKGtQBrq584UHlj0fNjnGZTkjuqUy8THiwksXeKOHx6tEv2"
            />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xl font-bold text-on-surface">Precision Sprayer V2</h4>
              <p className="text-sm text-on-surface-variant">Durable & Lightweight</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-2xl font-bold">₹2,299</span>
            <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          </div>
        </div>
        
        {/* Product 3 */}
        <div className="min-w-[350px] bg-surface-container-lowest rounded-[2rem] p-6 shadow-sm border border-outline-variant/10 group cursor-pointer">
          <div className="aspect-square rounded-2xl overflow-hidden mb-6">
            <img 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="handful of rich dark soil with small green sapling sprout showing health and vitality" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEmXCBKz-89C_8YcJISWNWhtPJPjtUpINa5AWXqlDAz7vGROjWSy2R6syAghaVz0NjzNxBx_G-hpKX1MwKZYZ85P0OagkcsPmaluuDY8fFkn2NbQyhKbJNgadNoSiw4fIDldY4U21hcdEva3xSLhXcUmaneq567XWt2L1or9-YGWln9BJNb_LxFGCHRDylYAoN7xAGKV2agZV8CuDI79VR3gKqJhR45dTUQafdv5rRQlMJO2l7jFOTO6-4jWtEKXXnOruHsz9qx2nT"
            />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xl font-bold text-on-surface">Premium Urea Plus</h4>
              <p className="text-sm text-on-surface-variant">Recommended for: Rice</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-2xl font-bold">₹850</span>
            <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">shopping_bag</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
