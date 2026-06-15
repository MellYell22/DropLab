import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown } from "lucide-react";

export default function PullToRefresh({ onRefresh, children, isLoading }) {
  const containerRef = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);
  const threshold = 60;

  const handleTouchStart = (e) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!pulling.current) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 100));
    }
  };

  const handleTouchEnd = () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance > threshold && !isLoading) {
      onRefresh();
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overscroll-none text-[#a22a2a]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>
      
      {/* Pull indicator */}
      <motion.div
        animate={{ height: pullDistance }}
        className="flex items-center justify-center overflow-hidden">
        
        <div className="flex items-center gap-2 text-zinc-500 pb-2">
          {isLoading ?
          <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> :
          pullDistance > threshold ?
          <span className="text-xs text-violet-400">Release to refresh</span> :

          <ChevronDown className="w-4 h-4" />
          }
        </div>
      </motion.div>
      {children}
    </div>);

}