import React from 'react';
import { motion } from 'framer-motion';
import { Timeline as AceternityTimeline } from './ui/timeline';
import { Mic, BrainCircuit, Lightbulb, Sprout } from 'lucide-react';

export default function Timeline() {
  const data = [
    {
      title: "Ask",
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            Speak or type your problem in your local language. No need to look up confusing scientific jargon.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-surface-container shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center text-primary group">
              <Mic size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm">Voice Input</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1592982537447-6f296b0f0b4a?q=80&w=800&auto=format&fit=crop"
              alt="Farmer using a smartphone"
              className="rounded-2xl object-cover h-full w-full shadow-sm border border-outline-variant/20"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Understand",
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            The AI instantly processes the context. It analyzes your historical crop history, local weather forecasts, and satellite data to pinpoint the exact issue.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1586771107445-d3af9e1501bc?q=80&w=800&auto=format&fit=crop"
              alt="AI analyzing crops in the field"
              className="rounded-2xl object-cover aspect-video md:aspect-[4/3] w-full shadow-sm border border-outline-variant/20"
            />
             <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-[4/3] bg-primary shadow-sm border border-white/10 flex flex-col items-center justify-center text-on-primary group">
              <BrainCircuit size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm">Deep Processing</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Advice",
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            Receive actionable, clear steps to fix the problem. You will get exact chemical or organic dosages, timing suggestions based on the rain forecast, and immediate fixes.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop"
              alt="Farmer receiving an advisory report"
              className="rounded-2xl object-cover aspect-video w-full shadow-sm border border-outline-variant/20"
            />
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-surface-container shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center text-primary group">
              <Lightbulb size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm">Actionable Fixes</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Thrive",
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            Watch your yield increase safely. By avoiding broad-spectrum spraying and applying targeted fertilizer only when necessary, your costs decrease while plant health soars.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-square bg-surface-container shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center text-primary group">
              <Sprout size={64} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed mb-4" />
              <p className="text-3xl font-bold font-headline">40%</p>
              <p className="mt-1 font-bold uppercase tracking-widest text-sm text-on-surface-variant">Cost Reduction</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1628522071665-27663e8a4d2e?q=80&w=800&auto=format&fit=crop"
              alt="Healthy high-yield harvest basket"
              className="rounded-2xl object-cover aspect-video md:aspect-square w-full shadow-sm border border-outline-variant/20"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="bg-surface relative overflow-hidden"
    >
      <div className="w-full">
        <AceternityTimeline data={data} />
      </div>
    </motion.section>
  );
}
