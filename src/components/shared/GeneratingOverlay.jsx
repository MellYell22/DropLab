import React from "react";
import { motion } from "framer-motion";
import WaveformVisualizer from "./WaveformVisualizer";

export default function GeneratingOverlay({ prompt }) {
  const [step, setStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  const steps = [
    "Analyzing musical structure...",
    "Composing melody & harmony...",
    "Generating audio waveforms...",
    "Applying effects & mixing...",
    "Finalizing your track..."
  ];

  React.useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 95));
    }, 500);
    
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
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
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-sky-500/30 blur-2xl"
          />
          <motion.div
            animate={{ scale: [1.1, 0.9, 1.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 opacity-60 blur-lg"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Creating your music...</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">"{prompt}"</p>
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-blue-400 font-medium"
          >
            {steps[step]}
          </motion.p>
        </div>

        <div className="w-64">
          <WaveformVisualizer isPlaying={true} color="#3B82F6" bars={30} height={32} />
        </div>

        <div className="w-full max-w-xs space-y-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-zinc-600">{Math.floor(progress)}% complete</p>
        </div>
      </motion.div>
    </motion.div>
  );
}