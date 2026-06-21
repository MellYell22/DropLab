import React from "react";
import { Slider } from "@/components/ui/slider";
import { Music2, GitBranch, Waves } from "lucide-react";

const musicalKeys = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

const keyModes = ["Major", "Minor", "Dorian", "Phrygian", "Lydian", "Mixolydian"];

export default function AdvancedControls({ 
  musicalKey, 
  keyMode, 
  melodyComplexity, 
  harmonicComplexity,
  onKeyChange,
  onModeChange,
  onMelodyChange,
  onHarmonicChange
}) {
  return (
    <div className="space-y-6">
      {/* Musical Key */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-300">Musical Key</h3>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {musicalKeys.map((key) => (
            <button
              key={key}
              onClick={() => onKeyChange(key)}
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                musicalKey === key
                  ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Key Mode */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300">Mode</h3>
        <div className="grid grid-cols-3 gap-2">
          {keyModes.map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                keyMode === mode
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Melody Complexity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-medium text-zinc-400">Melodic Complexity</span>
          </div>
          <span className="text-xs tabular-nums text-zinc-500">{melodyComplexity}</span>
        </div>
        <Slider
          value={[melodyComplexity]}
          onValueChange={([v]) => onMelodyChange(v)}
          max={100}
          step={1}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>Simple</span>
          <span>Intricate</span>
        </div>
      </div>

      {/* Harmonic Complexity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-medium text-zinc-400">Harmonic Richness</span>
          </div>
          <span className="text-xs tabular-nums text-zinc-500">{harmonicComplexity}</span>
        </div>
        <Slider
          value={[harmonicComplexity]}
          onValueChange={([v]) => onHarmonicChange(v)}
          max={100}
          step={1}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>Basic</span>
          <span>Complex</span>
        </div>
      </div>
    </div>
  );
}