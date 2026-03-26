import React from 'react';
import { motion } from 'framer-motion';
import { Timeline as AceternityTimeline } from './ui/timeline';
import { Mic, BrainCircuit, Lightbulb, Sprout } from 'lucide-react';

export default function Timeline() {
  const commonClasses = "rounded-2xl w-full h-40 md:h-56 lg:h-72 shadow-xl ring-1 ring-black/5 transition-all duration-500 ease-out";
  const imageClass = `object-cover hover:scale-105 ${commonClasses}`;
  const iconBaseClass = `relative overflow-hidden flex flex-col items-center justify-center cursor-default group hover:brightness-110 ${commonClasses}`;

  const data = [
    {
      title: "Ask",
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            Speak or type your problem in your local language. No need to look up confusing scientific jargon.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className={`bg-surface-container text-primary ${iconBaseClass}`}>
              <Mic size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed duration-500" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm text-center px-2">Voice Input</p>
            </div>
            <img
              src="/step1.png"
              alt="Step 1: Ask"
              className={imageClass}
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
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/step 2.png"
              alt="Step 2: Understand"
              className={imageClass}
            />
             <div className={`bg-primary text-on-primary ${iconBaseClass}`}>
              <BrainCircuit size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed duration-500" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm text-center px-2">Deep Processing</p>
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
            <div className={`bg-surface-container text-primary ${iconBaseClass}`}>
              <Lightbulb size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed duration-500" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm text-center px-2">Actionable Fixes</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop"
              alt="Farmer receiving an advisory report"
              className={imageClass}
            />
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
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/step4.png"
              alt="Step 4: Thrive"
              className={imageClass}
            />
             <div className={`bg-surface-container text-primary ${iconBaseClass}`}>
              <Sprout size={64} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed mb-4 duration-500" />
              <p className="text-3xl font-bold font-headline">40%</p>
              <p className="mt-1 font-bold uppercase tracking-widest text-xs text-on-surface-variant text-center">Cost Reduction</p>
            </div>
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
