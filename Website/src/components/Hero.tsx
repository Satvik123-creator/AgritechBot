import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const frameCount = 192; // Configured for 192 total frames

  // Preload images once component mounts
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadCount = 0;

    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        // ezgif-frame-001.jpg up to 192
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
        
        img.onload = () => {
            loadCount++;
            // When the first frame loads, perform initial draw immediately
            if (i === 1) requestAnimationFrame(() => drawFrame(0));
            // Force state update after batches to reduce churn
            if (loadCount === frameCount || loadCount % 20 === 0) {
              setImages([...loadedImages]);
            }
        };
        loadedImages.push(img);
    }
    
    // Set initial array reference
    setImages(loadedImages);
  }, []);

  const drawFrame = (index: number) => {
    if (images.length > 0 && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const img = images[index];
            if (img && img.complete && img.naturalWidth !== 0) {
                // Match resolution to screen size dynamically
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                
                // Standard "object-cover" logic for canvas drawing
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio  = Math.max(hRatio, vRatio);
                const centerShift_x = (canvas.width - img.width * ratio) / 2;
                const centerShift_y = (canvas.height - img.height * ratio) / 2;  

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // The globalAlpha mimics the requested opacity: 60 from the previous <video className="opacity-60">
                ctx.globalAlpha = 0.6;
                ctx.drawImage(img, 0, 0, img.width, img.height,
                              centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);  
            }
        }
    }
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map progress (0.0 - 1.0) directly onto frames 0 through 191
    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(latest * frameCount)
    );
    requestAnimationFrame(() => drawFrame(frameIndex));
  });

  // Re-draw current frame when resizing window
  useEffect(() => {
    const handleResize = () => {
       const latest = scrollYProgress.get();
       const frameIndex = Math.min(frameCount - 1, Math.floor(latest * frameCount));
       drawFrame(frameIndex);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // Draw frame requires `images`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // Framer motion transforms for synchronized text overlays
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [1, 1, 0, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0, 0, -50, -50]);

  const opacity2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.7], [50, 0, 0, -50]);

  const opacity3 = useTransform(scrollYProgress, [0.6, 0.8, 1, 1], [0, 1, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.6, 0.8, 1, 1], [50, 0, 0, 0]);

  return (
    // Height determines how long the scroll lasts. 400vh gives 4 viewports of scrolling.
    <section ref={containerRef} className="relative h-[400vh] bg-primary">
      {/* Sticky container holds the canvas sequence in view */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-primary">
        
        {/* Render sequence onto a full width/height background canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full pointer-events-none" 
        />

        {/* Text Area 1 */}
        <motion.div 
          style={{ opacity: opacity1, y: y1 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 md:px-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-8 shadow-2xl">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>colors_spark</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">The Future of Farming</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tight leading-[1] drop-shadow-2xl">
            Your AI <br />
            <span className="text-tertiary-fixed italic">Farming</span> <br />
            Assistant.
          </h1>
          <p className="mt-8 text-xl text-stone-200 font-body max-w-2xl drop-shadow-lg font-medium">
            Bridging the expert gap with multilingual voice AI that understands your soil, your weather, and your crops.
          </p>
        </motion.div>

        {/* Text Area 2 */}
        <motion.div 
          style={{ opacity: opacity2, y: y2 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 md:px-8 text-center"
        >
          <h2 className="text-5xl md:text-8xl font-headline font-bold text-tertiary-fixed tracking-tight drop-shadow-2xl">
            Intelligent Data.
          </h2>
          <p className="mt-6 text-2xl text-white font-body max-w-2xl drop-shadow-lg font-medium">
            Real-time analytics and precision tools for every acre, completely tailored to your local environment.
          </p>
        </motion.div>

        {/* Text Area 3 */}
        <motion.div 
          style={{ opacity: opacity3, y: y3 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 md:px-8 text-center"
        >
          <h2 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tight drop-shadow-2xl">
            Harvest with <span className="text-tertiary-fixed">Confidence.</span>
          </h2>
          <p className="mt-6 text-2xl text-white font-body max-w-2xl drop-shadow-lg font-medium">
            Watch your yield increase and costs decrease.
          </p>
          <div className="mt-12 flex items-center justify-center gap-4 pointer-events-auto">
            <button className="bg-tertiary-fixed text-on-tertiary-fixed px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-all">
              Start Your Free Trial
            </button>
            <button className="flex items-center gap-2 font-bold px-8 py-5 rounded-2xl border border-white/30 text-white backdrop-blur-md hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined">play_circle</span>
              Watch Demo
            </button>
          </div>
        </motion.div>
        
        {/* Overlay gradient to blend bottom edge with the next section */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface to-transparent"></div>
      </div>
    </section>
  );
}
