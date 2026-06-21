import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";

export default function MasteringControls({ track }) {
  const [settings, setSettings] = useState({
    compression: 70,
    eq: 50,
    stereoWidth: 60,
    loudness: -14,
    dynamicRange: 80,
    platform: "streaming"
  });

  const masterMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('masterTrack', {
        track_id: track.id,
        settings
      });
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Compression</span>
            <span className="text-zinc-500">{settings.compression}%</span>
          </div>
          <Slider
            value={[settings.compression]}
            onValueChange={([v]) => setSettings({...settings, compression: v})}
            max={100}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">EQ Balance</span>
            <span className="text-zinc-500">{settings.eq}%</span>
          </div>
          <Slider
            value={[settings.eq]}
            onValueChange={([v]) => setSettings({...settings, eq: v})}
            max={100}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Stereo Width</span>
            <span className="text-zinc-500">{settings.stereoWidth}%</span>
          </div>
          <Slider
            value={[settings.stereoWidth]}
            onValueChange={([v]) => setSettings({...settings, stereoWidth: v})}
            max={100}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Loudness</span>
            <span className="text-zinc-500">{settings.loudness} LUFS</span>
          </div>
          <Slider
            value={[settings.loudness + 20]}
            onValueChange={([v]) => setSettings({...settings, loudness: v - 20})}
            min={0}
            max={40}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-zinc-400">Optimize For</label>
        <div className="grid grid-cols-3 gap-2">
          {["streaming", "club", "radio"].map((platform) => (
            <button
              key={platform}
              onClick={() => setSettings({...settings, platform})}
              className={`py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                settings.platform === platform
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => masterMutation.mutate()}
        disabled={masterMutation.isPending}
        className="w-full"
      >
        {masterMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mastering...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Apply AI Mastering
          </>
        )}
      </Button>
    </div>
  );
}