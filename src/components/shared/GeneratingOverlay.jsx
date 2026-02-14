import React from "react";
import { motion } from "framer-motion";
import WaveformVisualizer from "./WaveformVisualizer";

export default function GeneratingOverlay({ prompt }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-8 max-w-md text-center px-6"
      >
        {/* Animated orb */}
        <div className="relative w-32 h-32">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600/30 via-emerald-500/20 to-sky-500/30 blur-2xl"
          />
          <motion.div
            animate={{ scale: [1.1, 0.9, 1.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-600 to-emerald-500 opacity-60 blur-lg"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-500 to-emerald-400 shadow-2xl"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Creating your music...</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">"{prompt}"</p>
        </div>

        <div className="w-64">
          <WaveformVisualizer isPlaying={true} color="#8B5CF6" bars={30} height={32} />
        </div>

        <div className="flex items-center gap-2">
          {["Composing melody", "Layering instruments", "Mixing & mastering"].map((step, i) => (
            <motion.span
              key={step}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, delay: i * 0.8, repeat: Infinity }}
              className="text-[11px] text-zinc-500 px-2 py-1 rounded-full bg-white/5"
            >
              {step}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}