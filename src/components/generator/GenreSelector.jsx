import React from "react";
import { motion } from "framer-motion";
import { Music, Headphones, Mic2, Guitar, Piano, Waves, Cloud, Film, Music2, Heart, TreePine, Flame } from "lucide-react";

const genres = [
  { id: "pop", label: "Pop", icon: Music, color: "#EC4899" },
  { id: "edm", label: "EDM", icon: Headphones, color: "#8B5CF6" },
  { id: "hip_hop", label: "Hip Hop", icon: Mic2, color: "#F59E0B" },
  { id: "rock", label: "Rock", icon: Guitar, color: "#EF4444" },
  { id: "classical", label: "Classical", icon: Piano, color: "#6366F1" },
  { id: "lofi", label: "Lo-Fi", icon: Waves, color: "#06D6A0" },
  { id: "ambient", label: "Ambient", icon: Cloud, color: "#38BDF8" },
  { id: "cinematic", label: "Cinematic", icon: Film, color: "#A78BFA" },
  { id: "jazz", label: "Jazz", icon: Music2, color: "#F97316" },
  { id: "rnb", label: "R&B", icon: Heart, color: "#E879F9" },
  { id: "folk", label: "Folk", icon: TreePine, color: "#22C55E" },
  { id: "metal", label: "Metal", icon: Flame, color: "#DC2626" },
];

export default function GenreSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {genres.map((genre) => {
        const Icon = genre.icon;
        const isSelected = selected === genre.id;
        return (
          <motion.button
            key={genre.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(genre.id)}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 ${
              isSelected
                ? "glass-strong ring-1"
                : "hover:bg-white/5"
            }`}
            style={{
              borderColor: isSelected ? genre.color : "transparent",
              boxShadow: isSelected ? `0 0 20px ${genre.color}30` : "none",
            }}
          >
            <Icon
              className="w-5 h-5 transition-colors"
              style={{ color: isSelected ? genre.color : "#71717a" }}
            />
            <span
              className="text-[11px] font-medium tracking-wide transition-colors"
              style={{ color: isSelected ? "#fff" : "#71717a" }}
            >
              {genre.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}