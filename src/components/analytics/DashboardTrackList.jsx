import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Music, Clock } from "lucide-react";
import moment from "moment";

export default function DashboardTrackList({ tracks }) {
  const playerState = typeof window !== 'undefined' ? window.__playerState : null;
  const currentTrack = playerState?.currentTrack;
  const isPlaying = playerState?.isPlaying;

  const handlePlay = (track) => {
    if (playerState) {
      if (currentTrack?.id === track.id) {
        playerState.setIsPlaying(!isPlaying);
      } else {
        playerState.setCurrentTrack(track);
        playerState.setIsPlaying(true);
      }
    }
  };

  if (!tracks || tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
          <Music className="w-5 h-5 text-blue-400" />
        </div>
        <p className="text-sm text-zinc-400">No tracks yet</p>
        <p className="text-xs text-zinc-600 mt-1">Generate your first track to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {tracks.map((track, i) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isTrackPlaying = isCurrentTrack && isPlaying;

        return (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
              isCurrentTrack
                ? "bg-blue-500/10 border border-blue-500/15"
                : "hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            {/* Play button */}
            <button
              onClick={() => handlePlay(track)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                isTrackPlaying
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-white/10"
              }`}
            >
              {isTrackPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            {/* Track cover or fallback */}
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {track.cover_url ? (
                <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-4 h-4 text-zinc-600" />
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isCurrentTrack ? "text-blue-300" : "text-white"}`}>
                {track.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-500 capitalize">
                  {(track.genre || "").replace("_", " ")}
                </span>
                {track.bpm && (
                  <span className="text-xs text-zinc-600">{track.bpm} BPM</span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {track.created_date ? moment(track.created_date).format("MMM D, YYYY") : "—"}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}