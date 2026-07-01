import React from "react";
import { motion } from "framer-motion";
import { VolumeX, User, UserCircle, Users, Mic, Wind, Bot } from "lucide-react";

const vocalTypes = [
  { id: "none", label: "No Vocals", icon: VolumeX },
  { id: "male", label: "Male", icon: User },
  { id: "female", label: "Female", icon: UserCircle },
  { id: "choir", label: "Choir", icon: Users },
  { id: "rap", label: "Rap", icon: Mic },
  { id: "whisper", label: "Whisper", icon: Wind },
  { id: "robotic", label: "Robotic", icon: Bot },
];

export default function VocalSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {vocalTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selected === type.id;
        return (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(type.id)}
            className={`flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
                : "bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/8"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {type.label}
          </motion.button>
        );
      })}
    </div>
  );
}