import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-stone-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 py-16 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-xl font-bold text-emerald-950 font-headline"><img src="https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773932879/Full_Logo_dt1pqi.png" alt="" /></div>
          <p className="text-stone-500 font-body text-sm leading-relaxed">
            Rooted in intelligence. Growing the future of sustainable and profitable agriculture for everyone.
          </p>
        </div>
        
        <div>
          <h5 className="text-emerald-900 font-bold mb-6">Company</h5>
          <ul className="space-y-4">
            <li><a className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" href="#">About Us</a></li>
            <li><a className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" href="#">Sustainability Report</a></li>
            <li><a className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" href="#">Global Sitemap</a></li>
          </ul>
        </div>
        
        <div>
          <h5 className="text-emerald-900 font-bold mb-6">Support</h5>
          <ul className="space-y-4">
            <li><a className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" href="#">Contact Support</a></li>
            <li><a className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" href="#">Privacy Policy</a></li>
            <li><a className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" href="#">Terms of Service</a></li>
          </ul>
        </div>
        
        <div>
          <h5 className="text-emerald-900 font-bold mb-6">Connect</h5>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-tertiary-fixed transition-colors">
              <span className="material-symbols-outlined text-sm">public</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-tertiary-fixed transition-colors">
              <span className="material-symbols-outlined text-sm">share</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-stone-500 font-body text-sm tracking-wide">© 2026 Anaaj.ai Precision. Rooted in Intelligence.</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-tighter">Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}
