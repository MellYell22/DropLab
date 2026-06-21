import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, Search, SlidersHorizontal, Music, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import TrackCard from "../components/shared/TrackCard";
import PullToRefresh from "../components/shared/PullToRefresh";

const genres = ["all", "pop", "edm", "hip_hop", "rock", "classical", "lofi", "ambient", "cinematic", "jazz", "rnb", "folk", "metal"];

export default function Library() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading, refetch } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => base44.entities.Track.list("-created_date", 100),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["tracks"] });
  };

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.prompt?.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = activeGenre === "all" || t.genre === activeGenre;
    return matchesSearch && matchesGenre;
  });

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

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 radial-glow"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Library</h1>
            <p className="text-sm text-zinc-500 mt-1">{tracks.length} tracks generated</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracks..."
                className="pl-9 bg-white/5 border-white/10 text-sm h-9"
              />
            </div>
            <div className="flex glass rounded-lg p-0.5">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white/10 text-white" : "text-zinc-500"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white/10 text-white" : "text-zinc-500"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Genre tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar"
        >
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeGenre === g
                  ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {g === "all" ? "All" : g.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <PullToRefresh onRefresh={handleRefresh} isLoading={isLoading}>
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : filteredTracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Music className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">No tracks yet</h3>
            <p className="text-sm text-zinc-500 mt-1">Create your first track to see it here</p>
          </motion.div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                onPlay={handlePlay}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                variant="list"
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