import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Scissors, GitBranch, Download, FileMusic, Layers, Wand2, Loader2, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import MasteringControls from "./MasteringControls";
import VersionHistory from "./VersionHistory";

export default function TrackEditor({ track, onClose }) {
  const [activeTab, setActiveTab] = useState("stems");
  const [isProcessing, setIsProcessing] = useState(false);

  const generateStemsMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const response = await base44.functions.invoke('generateStems', { track_id: track.id });
      return response.data;
    },
    onSuccess: () => {
      setIsProcessing(false);
    },
    onError: () => {
      setIsProcessing(false);
    }
  });

  const exportMIDIMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const response = await base44.functions.invoke('exportMIDI', { track_id: track.id });
      return response.data;
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      if (data.midi_url) {
        window.open(data.midi_url, '_blank');
      }
    },
    onError: () => {
      setIsProcessing(false);
    }
  });

  const tabs = [
    { id: "stems", label: "Stem Separation", icon: Layers },
    { id: "remix", label: "AI Remix", icon: Wand2 },
    { id: "mastering", label: "AI Mastering", icon: Sparkles },
    { id: "versions", label: "Version History", icon: History },
    { id: "export", label: "Export", icon: Download },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "max(1rem, env(safe-area-inset-bottom))", paddingLeft: "1rem", paddingRight: "1rem" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-strong rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-1">{track.title}</h2>
          <p className="text-sm text-zinc-500">Advanced Editing Suite</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-violet-300 border-b-2 border-violet-500"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-96">
          {activeTab === "stems" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Separate your track into individual instrument stems for advanced mixing and production.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Drums", "Bass", "Melody", "Harmony", "Vocals"].map((stem) => (
                  <div key={stem} className="glass rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">{stem}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      disabled={isProcessing}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => generateStemsMutation.mutate()}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4 mr-2" />
                    Generate All Stems
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === "remix" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Use AI to create variations and remixes of your track.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Wand2 className="w-5 h-5" />
                  <span className="text-xs">Speed Up/Down</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <GitBranch className="w-5 h-5" />
                  <span className="text-xs">Change Key</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Layers className="w-5 h-5" />
                  <span className="text-xs">Add Layer</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Scissors className="w-5 h-5" />
                  <span className="text-xs">Trim/Loop</span>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "mastering" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Professional AI-powered mastering for streaming, radio, or club playback.
              </p>
              <MasteringControls track={track} />
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                View and restore previous versions of your track.
              </p>
              <VersionHistory track={track} />
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Export your track in various professional formats for DAW integration.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open(track.audio_url, '_blank')}
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export MP3 (320kbps)
                  </span>
                  <span className="text-xs text-zinc-500">High Quality</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open(track.audio_url, '_blank')}
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export WAV (Lossless)
                  </span>
                  <span className="text-xs text-zinc-500">Studio Quality</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => exportMIDIMutation.mutate()}
                  disabled={isProcessing}
                >
                  <span className="flex items-center gap-2">
                    <FileMusic className="w-4 h-4" />
                    Export MIDI
                  </span>
                  <span className="text-xs text-zinc-500">DAW Compatible</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => generateStemsMutation.mutate()}
                  disabled={isProcessing}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Export Multi-Track Stems
                  </span>
                  <span className="text-xs text-zinc-500">Mixing Ready</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}