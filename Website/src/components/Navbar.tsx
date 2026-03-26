import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Trigger floating pill state after 50px of scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const toggleMenu = () => setIsOpen(!isOpen);
  const isActive = (path: string) => location.pathname === path;
  
  // To ensure the white logo is always visible on light paths, we always inject a dark glass aesthetic
  const isDarkCanvas = location.pathname === '/' || location.pathname === '/chat';

  return (
    <motion.nav 
      initial={{ x: "-50%", y: -100 }}
      animate={{ x: "-50%", y: 0 }}
      className={`fixed z-[100] transition-all duration-500 left-1/2 w-full
        ${isScrolled 
          ? 'top-4 w-[calc(100%-2rem)] md:w-[90%] max-w-6xl rounded-[2rem] bg-emerald-950/80 backdrop-blur-xl shadow-2xl border border-white/10' 
          : `top-0 max-w-full ${isDarkCanvas ? 'bg-transparent' : 'bg-emerald-950/90 backdrop-blur-lg border-b border-white/5 shadow-md'}`
        }
      `}
    >
      <div className={`flex justify-between items-center w-full max-w-7xl mx-auto px-6 md:px-8 ${isScrolled ? 'py-3' : 'py-5'} transition-all duration-300`}>
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src="https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773933014/FullWhiteLogo_nlnlbh.svg" 
            alt="Anaaj.ai Logo" 
            className={`transition-all duration-500 ease-[cubic-bezier(0.2,1,0.2,1)] ${isScrolled ? 'h-7 md:h-8' : 'h-8 md:h-10'}`} 
          />
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center bg-white/5 px-6 py-2 rounded-full border border-white/10">
          <Link to="/" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            Home
          </Link>
          <Link to="/chat" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/chat') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            AgriBot AI
          </Link>
          <Link to="/contact" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/contact') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            Contact
          </Link>
        </div>
        
        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/download" className="flex items-center gap-2 text-stone-300 hover:text-lime-400 font-bold text-sm tracking-wider uppercase transition-colors mr-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Get App
          </Link>
          <button className="material-symbols-outlined text-white hover:scale-105 transition-transform duration-200">
            language
          </button>
          <Link to="/chat" className="bg-white text-emerald-950 px-6 py-2.5 rounded-full font-bold hover:scale-105 hover:bg-lime-400 active:opacity-80 transition-all shadow-lg text-sm uppercase tracking-wider">
            Try Bot
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-white focus:outline-none focus:ring-2 focus:ring-lime-400 rounded-lg p-1 bg-white/10 backdrop-blur-md">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className={`md:hidden absolute top-full left-0 w-full mt-2 rounded-[2rem] overflow-hidden bg-emerald-950/95 backdrop-blur-3xl shadow-2xl border border-white/10 origin-top transform transition-all duration-300 ${isScrolled ? 'w-[calc(100%+0rem)]' : ''}`}>
          <div className="flex flex-col px-6 py-8 gap-6 text-center">
            <Link to="/" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/') ? 'text-lime-400' : 'text-stone-200'}`}>
              Home
            </Link>
            <Link to="/chat" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/chat') ? 'text-lime-400' : 'text-stone-200'}`}>
              AgriBot AI
            </Link>
            <Link to="/contact" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/contact') ? 'text-lime-400' : 'text-stone-200'}`}>
              Contact
            </Link>
            <Link to="/download" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/download') ? 'text-lime-400' : 'text-stone-200'}`}>
              Get App
            </Link>
            <hr className="border-white/10 mx-10 my-2" />
            <Link to="/chat" onClick={toggleMenu} className="bg-lime-400 text-emerald-950 text-center px-6 py-4 rounded-2xl font-bold mx-4 shadow-xl uppercase tracking-widest hover:scale-105 transition-transform">
              Try For Free
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
