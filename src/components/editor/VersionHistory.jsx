import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VersionHistory({ track }) {
  const { data: versions = [] } = useQuery({
    queryKey: ["track-versions", track.id],
    queryFn: () => base44.entities.TrackVersion.filter({ parent_track_id: track.id })
  });

  return (
    <div className="space-y-3">
      {versions.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">No versions yet</p>
      ) : (
        <div className="space-y-2">
          {versions.map((version, i) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-strong rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      Version {version.version_number}
                    </h4>
                    {version.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{version.changes}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => version.audio_url && window.open(version.audio_url, '_blank')}
                  disabled={!version.audio_url}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                <Clock className="w-3 h-3" />
                {new Date(version.created_date).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}