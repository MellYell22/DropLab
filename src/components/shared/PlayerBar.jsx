import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Download, Repeat, Shuffle, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import WaveformVisualizer from "./WaveformVisualizer";

const genreColors = {
  pop: "#EC4899", edm: "#8B5CF6", hip_hop: "#F59E0B", rock: "#EF4444",
  classical: "#6366F1", lofi: "#06D6A0", ambient: "#38BDF8", cinematic: "#A78BFA",
  jazz: "#F97316", rnb: "#E879F9", folk: "#22C55E", metal: "#DC2626",
};

export default function PlayerBar({ track, isPlaying, onTogglePlay }) {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(false);

  // Load and play audio when track changes
  useEffect(() => {
    if (track?.audio_url && audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [track]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  // Update progress as audio plays
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || track?.duration || 0;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  // Seek when user drags progress bar
  const handleSeek = (value) => {
    if (audioRef.current && duration) {
      const newTime = (value / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
    }
  };

  if (!track) return null;
  const color = genreColors[track.genre] || "#3093A0";

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => onTogglePlay()}
      />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 border-t border-white/[0.06]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", background: "rgba(14, 6, 58, 0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        {/* Progress bar */}
        <div className="px-4">
          <Slider
            value={[progress]}
            onValueChange={([v]) => handleSeek(v)}
            max={100}
            step={0.1}
            className="cursor-pointer -mt-1.5"
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 w-64 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              {track.cover_url ? (
                <img src={track.cover_url} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Music className="w-4 h-4" style={{ color }} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{track.title}</p>
              <p className="text-[10px] text-zinc-500 truncate">{track.genre?.replace("_", " ")}</p>
            </div>
            <button onClick={() => setLiked(!liked)} className="flex-shrink-0">
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-pink-500 text-pink-500" : "text-zinc-600"}`} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: color }}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </motion.button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time + Volume */}
          <div className="flex items-center gap-3 w-64 justify-end">
            <span className="text-[10px] tabular-nums text-zinc-500">
              {formatTime(currentTime)} / {formatTime(duration || track.duration || 0)}
            </span>
            <button onClick={() => setMuted(!muted)} className="text-zinc-500 hover:text-white transition-colors">
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <div className="w-20">
              <Slider
                value={[muted ? 0 : volume]}
                onValueChange={([v]) => { setVolume(v); setMuted(false); }}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>
            <a
              href={track.audio_url}
              download={`${track.title}.mp3`}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}