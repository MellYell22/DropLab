import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, GripVertical } from "lucide-react";

const sections = [
  { id: "intro", label: "Intro", color: "#38BDF8" },
  { id: "verse", label: "Verse", color: "#8B5CF6" },
  { id: "chorus", label: "Chorus", color: "#EC4899" },
  { id: "bridge", label: "Bridge", color: "#F59E0B" },
  { id: "drop", label: "Drop", color: "#EF4444" },
  { id: "outro", label: "Outro", color: "#06D6A0" },
  { id: "loop", label: "Loop", color: "#6366F1" },
];

export default function StructureBuilder({ structure, onChange }) {
  const addSection = (id) => {
    onChange([...structure, id]);
  };

  const removeSection = (index) => {
    onChange(structure.filter((_, i) => i !== index));
  };

  const getSectionData = (id) => sections.find((s) => s.id === id);

  return (
    <div className="space-y-3">
      {/* Current structure */}
      <div className="flex flex-wrap gap-1.5 min-h-[40px] p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <AnimatePresence mode="popLayout">
          {structure.length === 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-zinc-600"
            >
              Click sections below to build your structure...
            </motion.span>
          )}
          {structure.map((id, index) => {
            const section = getSectionData(id);
            if (!section) return null;
            return (
              <motion.div
                key={`${id}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${section.color}20`,
                  color: section.color,
                }}
              >
                {section.label}
                <button
                  onClick={() => removeSection(index)}
                  className="ml-0.5 min-h-[28px] min-w-[28px] flex items-center justify-center hover:opacity-70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Available sections */}
      <div className="flex flex-wrap gap-1.5">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addSection(section.id)}
            className="flex items-center gap-1 min-h-[44px] px-3 py-2 rounded-md text-[11px] font-medium bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            {section.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}