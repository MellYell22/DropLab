import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Download, Share2, MoreHorizontal, Clock, Music, Edit } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";
import TrackEditor from "../editor/TrackEditor";
import TrackShareDialog from "./TrackShareDialog";

const genreColors = {
  pop: "#EC4899",
  edm: "#8B5CF6",
  hip_hop: "#F59E0B",
  rock: "#EF4444",
  classical: "#6366F1",
  lofi: "#06D6A0",
  ambient: "#38BDF8",
  cinematic: "#A78BFA",
  jazz: "#F97316",
  rnb: "#E879F9",
  folk: "#22C55E",
  metal: "#DC2626",
};

export default function TrackCard({ track, onPlay, isPlaying, variant = "default" }) {
  const [liked, setLiked] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const color = genreColors[track.genre] || "#8B5CF6";

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      await base44.entities.Track.update(track.id, {
        likes: (track.likes || 0) + (newLiked ? 1 : -1),
      });
    } catch {}
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "3:24";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (variant === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass group flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
        onClick={() => onPlay?.(track)}
      >
        {/* Cover */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={{ background: `${color}15` }}
        >
          {track.cover_url ? (
            <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music className="w-5 h-5" style={{ color }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{track.title}</h4>
          <p className="text-[11px] text-zinc-500 truncate">{track.prompt}</p>
        </div>

        {/* Waveform */}
        <div className="hidden md:block w-32">
          <WaveformVisualizer isPlaying={isPlaying} color={color} bars={20} height={24} />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(track.duration)}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: `${color}20`, color }}
          >
            {track.genre?.replace("_", " ")}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowShare(true); }}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-500 hover:text-white transition-colors" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl overflow-hidden group cursor-pointer"
      onClick={() => onPlay?.(track)}
    >
      {/* Cover */}
      <div
        className="relative h-40 flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        }}
      >
        {track.cover_url ? (
          <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Music className="w-10 h-10" style={{ color: `${color}60` }} />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: color }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </motion.div>
        </div>

        {/* Genre badge */}
        <div
          className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg"
          style={{ background: `${color}30`, color }}
        >
          {track.genre?.replace("_", " ")}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-white truncate">{track.title}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{track.prompt}</p>
        </div>

        <WaveformVisualizer isPlaying={isPlaying} color={color} bars={30} height={28} />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-zinc-600 text-[11px]">
            <Clock className="w-3 h-3" />
            {formatDuration(track.duration)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="p-1 hover:bg-white/5 rounded-md transition-colors"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${liked ? "fill-pink-500 text-pink-500" : "text-zinc-600"}`}
              />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowEditor(true); }}
              className="p-1 hover:bg-white/5 rounded-md transition-colors"
              title="Edit & Export"
            >
              <Edit className="w-3.5 h-3.5 text-zinc-600" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowShare(true); }}
              className="p-1 hover:bg-white/5 rounded-md transition-colors"
              title="Share to Stories"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-600" />
            </button>
            <a
              href={track.audio_url}
              download={`${track.title}.mp3`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-white/5 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
            </a>
          </div>
        </div>
      </div>

      {showEditor && <TrackEditor track={track} onClose={() => setShowEditor(false)} />}
      {showShare && <TrackShareDialog track={track} onClose={() => setShowShare(false)} />}
    </motion.div>
  );
}