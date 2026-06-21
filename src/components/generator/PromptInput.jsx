import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const suggestions = [
  "Epic cinematic orchestral with soaring strings",
  "Chill lo-fi hip hop for studying, rainy day vibes",
  "Dark trap beat with heavy 808s and eerie melody",
  "Upbeat pop anthem with catchy hook, summer feel",
  "Ambient electronic soundscape, floating textures",
  "Acoustic folk with warm guitar and gentle vocals",
];

export default function PromptInput({ value, onChange, onGenerate, isGenerating }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative space-y-3">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-emerald-500/20 to-sky-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative glass-strong rounded-2xl overflow-hidden">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Describe the music you want to create..."
            rows={3}
            className="w-full bg-transparent px-5 pt-5 pb-14 text-sm text-white placeholder:text-zinc-600 focus:outline-none resize-none"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="gradient-purple text-white rounded-xl px-5 py-2 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2">
        <Wand2 className="w-3.5 h-3.5 text-zinc-600 mt-1" />
        {suggestions.slice(0, 3).map((suggestion) => (
          <motion.button
            key={suggestion}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(suggestion)}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 bg-white/5 hover:bg-white/8 px-3 py-1.5 rounded-lg transition-colors"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
}