import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Download, Music, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const genreColors = {
  pop: "#EC4899", edm: "#8B5CF6", hip_hop: "#F59E0B", rock: "#EF4444",
  classical: "#6366F1", lofi: "#06D6A0", ambient: "#38BDF8", cinematic: "#A78BFA",
  jazz: "#F97316", rnb: "#E879F9", folk: "#22C55E", metal: "#DC2626",
};

export default function InlineTrackPlayer({ track, onDismiss }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const color = genreColors[track?.genre] || "#8B5CF6";

  useEffect(() => {
    if (track?.audio_url && audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.load();
    }
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || track?.duration || 0;
      setCurrentTime(current);
      setDuration(total);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current && duration) {
      const newTime = (value / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!track) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: 20, height: 0 }}
      className="overflow-hidden"
    >
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} />
      
      <div className="glass rounded-2xl p-5 space-y-4 border border-white/5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}20` }}
            >
              {track.cover_url ? (
                <img src={track.cover_url} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Music className="w-5 h-5" style={{ color }} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{track.title}</h3>
              <p className="text-xs text-zinc-500 capitalize">{track.genre?.replace("_", " ")} • {track.bpm} BPM • {track.key} {track.key_mode}</p>
            </div>
          </div>
          <button onClick={onDismiss} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Slider
            value={[progress]}
            onValueChange={([v]) => handleSeek(v)}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || track.duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{ background: color }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </motion.button>
          
          <a
            href={track.audio_url}
            download={`${track.title}.mp3`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download MP3
          </a>
        </div>
      </div>
    </motion.div>
  );
}