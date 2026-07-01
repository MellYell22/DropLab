import React from "react";
import { Slider } from "@/components/ui/slider";
import { Zap, Heart, Gauge, Brain, Moon, Sun } from "lucide-react";

const sliders = [
  { key: "energy", label: "Energy", icon: Zap, low: "Calm", high: "Intense", color: "#F59E0B" },
  { key: "complexity", label: "Complexity", icon: Brain, low: "Simple", high: "Complex", color: "#8B5CF6" },
  { key: "darkness", label: "Tone", icon: Moon, low: "Bright", high: "Dark", color: "#38BDF8" },
];

export default function MoodSliders({ values, onChange }) {
  return (
    <div className="space-y-5">
      {sliders.map((slider) => {
        const Icon = slider.icon;
        const val = values[slider.key] || 50;
        return (
          <div key={slider.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color: slider.color }} />
                <span className="text-xs font-medium text-zinc-400">{slider.label}</span>
              </div>
              <span className="text-xs tabular-nums text-zinc-500">{val}</span>
            </div>
            <Slider
              value={[val]}
              onValueChange={([v]) => onChange({ ...values, [slider.key]: v })}
              max={100}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between">
              <span className="text-xs text-zinc-600">{slider.low}</span>
              <span className="text-xs text-zinc-600">{slider.high}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}