import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Flame, Music, Loader2 } from "lucide-react";
import TrackCard from "../components/shared/TrackCard";
import PullToRefresh from "../components/shared/PullToRefresh";

export default function Explore() {
  const [tab, setTab] = useState("trending");
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["public-tracks"],
    queryFn: () => base44.entities.Track.filter({ is_public: true }, "-created_date", 50),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["public-tracks"] });
  };

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

  const tabs = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "top", label: "Top Rated", icon: Flame },
  ];

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 radial-glow"
          style={{
            background: "linear-gradient(135deg, rgba(29,111,187,0.15), rgba(48,147,160,0.10), rgba(55,156,124,0.06))",
          }}
        >
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Explore</h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-md">
              Discover music created by the community. Find inspiration for your next track.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-4 -top-4 w-32 h-32 rounded-full bg-cyan-500/10 blur-3xl" />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  tab === t.id
                    ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <PullToRefresh onRefresh={handleRefresh} isLoading={isLoading}>
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Music className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">No public tracks yet</h3>
            <p className="text-sm text-zinc-500 mt-1">Be the first to share your creation</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                onPlay={handlePlay}
              />
            ))}
          </div>
        )}
        </PullToRefresh>
      </div>
    </div>
  );
}