import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-[100vh] bg-surface pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-8 editorial-grid">
        
        {/* Left Info Column */}
        <div className="col-span-12 lg:col-span-5 space-y-12 mb-16 lg:mb-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-6 shadow-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              <span className="text-xs font-bold uppercase tracking-widest font-label">Talk To Us</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary tracking-tight leading-[1]">
              Get in touch with <span className="italic">experts.</span>
            </h1>
            <p className="mt-6 text-xl text-on-surface-variant font-body leading-relaxed max-w-md">
              Whether you have technical issues, want to implement Anaaj.ai for an entire village, or have partnership proposals, we respond within 12 hours.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">mail</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary">Email Support</h4>
                <p className="text-on-surface-variant text-sm mt-1">support@anaajai.com</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">call</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary">Toll Free</h4>
                <p className="text-on-surface-variant text-sm mt-1">1800-AGRI-100</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary">Headquarters</h4>
                <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
                  Agro-Tech Hub, Level 4<br/>
                  Sector 82, Mohali, Punjab<br/>
                  India 140308
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Form Column */}
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-outline-variant/10 relative overflow-hidden">
            {/* Aesthetic flare */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-3xl font-headline font-bold text-primary mb-8 relative z-10">Send a Message</h3>
            
            <form className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">First Name</label>
                  <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 placeholder-on-surface-variant/50 outline-none transition-all text-on-surface shadow-inner" placeholder="Ramesh" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">Last Name</label>
                  <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 placeholder-on-surface-variant/50 outline-none transition-all text-on-surface shadow-inner" placeholder="Kumar" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">Email Address</label>
                <input type="email" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 placeholder-on-surface-variant/50 outline-none transition-all text-on-surface shadow-inner" placeholder="ramesh.k@example.com" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">Message</label>
                <textarea rows={5} className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 placeholder-on-surface-variant/50 outline-none transition-all text-on-surface shadow-inner resize-none" placeholder="How can we help you?"></textarea>
              </div>
              
              <button type="button" className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                Send Output
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
}
