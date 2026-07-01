import React from "react";
import { Piano, Guitar, Mic2, Music, Waves, Volume2, Drum, Speaker } from "lucide-react";

const instruments = [
  { id: "piano", label: "Piano", icon: Piano },
  { id: "guitar", label: "Guitar", icon: Guitar },
  { id: "bass", label: "Bass", icon: Speaker },
  { id: "drums", label: "Drums", icon: Drum },
  { id: "synth", label: "Synth", icon: Waves },
  { id: "strings", label: "Strings", icon: Music },
  { id: "brass", label: "Brass", icon: Volume2 },
  { id: "vocals", label: "Vocals", icon: Mic2 },
];

export default function InstrumentSelector({ selected, onChange }) {
  const toggleInstrument = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(i => i !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {instruments.map((inst) => {
        const Icon = inst.icon;
        const isSelected = selected.includes(inst.id);
        return (
          <button
            key={inst.id}
            onClick={() => toggleInstrument(inst.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all ${
              isSelected
                ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{inst.label}</span>
          </button>
        );
      })}
    </div>
  );
}