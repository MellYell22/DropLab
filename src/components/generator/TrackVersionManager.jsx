import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Save, Check, ChevronDown, ChevronUp, Plus, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TrackVersionManager({ track, onSwitchVersion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["trackVersions", track?.id],
    queryFn: () => base44.entities.TrackVersion.filter({ parent_track_id: track?.id }, "version_number", 50),
    enabled: !!track?.id,
  });

  const activeVersion = versions.find(v => v.is_active) || null;
  const nextVersionNumber = versions.length + 1;

  const saveVersion = async () => {
    if (!track) return;
    setSaving(true);
    try {
      // Deactivate all existing versions
      for (const v of versions) {
        if (v.is_active) {
          await base44.entities.TrackVersion.update(v.id, { is_active: false });
        }
      }

      await base44.entities.TrackVersion.create({
        parent_track_id: track.id,
        version_number: nextVersionNumber,
        title: track.title || `Version ${nextVersionNumber}`,
        changes: `Generated with ${track.genre?.replace("_", " ")} style`,
        audio_url: track.audio_url,
        settings: {
          genre: track.genre,
          bpm: track.bpm,
          key: track.key,
          key_mode: track.key_mode,
          energy: track.energy,
          complexity: track.complexity,
          darkness: track.darkness,
          instruments: track.instruments,
          vocal_type: track.vocal_type,
          structure: track.structure,
        },
        is_active: true,
      });

      queryClient.invalidateQueries({ queryKey: ["trackVersions", track.id] });
      toast.success(`Saved as Version ${nextVersionNumber}`);
    } catch (err) {
      toast.error("Failed to save version");
    } finally {
      setSaving(false);
    }
  };

  const switchToVersion = async (version) => {
    try {
      // Deactivate all others
      for (const v of versions) {
        if (v.id !== version.id && v.is_active) {
          await base44.entities.TrackVersion.update(v.id, { is_active: false });
        }
      }
      if (!version.is_active) {
        await base44.entities.TrackVersion.update(version.id, { is_active: true });
      }

      queryClient.invalidateQueries({ queryKey: ["trackVersions", track.id] });

      // Switch the playing audio
      if (onSwitchVersion) {
        onSwitchVersion({
          ...track,
          audio_url: version.audio_url,
          title: version.title,
        });
      }

      toast.success(`Switched to Version ${version.version_number}`);
    } catch (err) {
      toast.error("Failed to switch version");
    }
  };

  if (!track) return null;

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Versions</span>
          {versions.length > 0 && (
            <span className="text-zinc-600">({versions.length})</span>
          )}
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <Button
          onClick={saveVersion}
          disabled={saving}
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2"
        >
          {saving ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Save className="w-3 h-3 mr-1" />
          )}
          Save as Version {nextVersionNumber}
        </Button>
      </div>

      {/* Version list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {isLoading ? (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="flex items-center gap-2 py-3 px-2 text-xs text-zinc-500">
                <History className="w-3.5 h-3.5" />
                No versions saved yet. Click "Save as Version" to save your first version.
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                {versions.map((v) => {
                  const isActive = v.is_active;
                  return (
                    <motion.button
                      key={v.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => switchToVersion(v)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                        isActive
                          ? "bg-blue-500/15 border border-blue-500/20"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        isActive ? "bg-blue-500/30 text-blue-300" : "bg-white/5 text-zinc-500"
                      }`}>
                        v{v.version_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isActive ? "text-blue-300" : "text-zinc-300"}`}>
                          {v.title}
                        </p>
                        {v.changes && (
                          <p className="text-xs text-zinc-500 truncate">{v.changes}</p>
                        )}
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}