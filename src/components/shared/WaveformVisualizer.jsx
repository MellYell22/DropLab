import React, { useEffect, useRef } from "react";

export default function WaveformVisualizer({ isPlaying, color = "#8B5CF6", bars = 40, height = 40 }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const valuesRef = useRef(Array(bars).fill(0).map(() => Math.random() * 0.3));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const barWidth = canvas.offsetWidth / bars;
    const gap = 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, height);

      valuesRef.current = valuesRef.current.map((v, i) => {
        if (isPlaying) {
          const target = 0.2 + Math.random() * 0.8;
          return v + (target - v) * 0.15;
        } else {
          return v + (0.15 - v) * 0.05;
        }
      });

      valuesRef.current.forEach((value, i) => {
        const barHeight = value * height;
        const x = i * barWidth + gap / 2;
        const w = barWidth - gap;
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, color + "CC");
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, color + "CC");

        ctx.beginPath();
        ctx.roundRect(x, y, w, barHeight, 1.5);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, color, bars, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
}