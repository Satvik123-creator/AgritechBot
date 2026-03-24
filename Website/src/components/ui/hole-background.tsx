import React, { useEffect, useRef } from "react";

export interface HoleBackgroundProps extends React.ComponentProps<"div"> {
  strokeColor?: string;
  numberOfLines?: number;
  numberOfDiscs?: number;
  particleRGBColor?: [number, number, number];
}

export const HoleBackground = ({
  strokeColor = "#737373",
  numberOfLines = 50,
  numberOfDiscs = 50,
  particleRGBColor = [255, 255, 255],
  className = "",
  ...props
}: HoleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      // Scale by device pixel ratio for sharp rendering on retina
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const maxRadius = Math.max(rect.width, rect.height);

      // Tunnel effect velocity
      time += 0.005;
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;

      // Draw expanding discs (circles)
      for (let i = 0; i < numberOfDiscs; i++) {
        // Offset each disc's "depth" by time
        let progress = (i / numberOfDiscs + time * 0.5) % 1; 
        
        // Cubic root gives exponential growth effect for 3D depth perception
        let r = maxRadius * Math.pow(progress, 3);
        
        // Prevent drawing circles that are too small
        if (r < 10) continue;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        
        // Fade in from center, fade out at edges
        let alpha = Math.sin(progress * Math.PI);
        ctx.globalAlpha = alpha * 0.5;
        ctx.stroke();
      }

      // Draw radiating lines
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < numberOfLines; i++) {
        const angle = (i / numberOfLines) * Math.PI * 2 + time;
        ctx.beginPath();
        // Inner radius strictly defines the "hole" center
        const innerR = 10;
        const outerR = maxRadius;
        
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.stroke();
      }

      // Draw scattered particles along the lines
      ctx.fillStyle = `rgb(${particleRGBColor[0]}, ${particleRGBColor[1]}, ${particleRGBColor[2]})`;
      for (let i = 0; i < numberOfDiscs / 2; i++) {
        let pProgress = (i / (numberOfDiscs / 2) + time * 0.8) % 1;
        let pr = maxRadius * Math.pow(pProgress, 3);
        if (pr < 30) continue;
        
        const angle = ((i * 3) / numberOfLines) * Math.PI * 2 + time * (i % 2 === 0 ? 1 : -1);
        ctx.globalAlpha = Math.sin(pProgress * Math.PI) * 0.8;
        
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * pr, cy + Math.sin(angle) * pr, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [strokeColor, numberOfLines, numberOfDiscs, particleRGBColor]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} {...props}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
