import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Plus, Save, X, Play, Share2, Copy, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GenreSelector from "../components/generator/GenreSelector";
import MoodSliders from "../components/generator/MoodSliders";
import VocalSelector from "../components/generator/VocalSelector";
import StructureBuilder from "../components/generator/StructureBuilder";

export default function StyleDNA() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingStyle, setEditingStyle] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    genre: "cinematic",
    mood_settings: { energy: 50, complexity: 50, darkness: 30 },
    vocal_type: "none",
    bpm: 120,
    structure: ["intro", "verse", "chorus", "verse", "chorus", "outro"],
    is_public: false,
  });

  const queryClient = useQueryClient();

  const { data: styles = [], isLoading } = useQuery({
    queryKey: ["style-dna"],
    queryFn: () => base44.entities.StyleDNA.list("-created_date", 100),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingStyle) {
        return await base44.entities.StyleDNA.update(editingStyle.id, data);
      }
      return await base44.entities.StyleDNA.create(data);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["style-dna"] });
      const previousStyles = queryClient.getQueryData(["style-dna"]);
      if (!editingStyle) {
        const optimisticStyle = {
          id: `temp-${Date.now()}`,
          ...data,
          created_date: new Date().toISOString(),
        };
        queryClient.setQueryData(["style-dna"], (old) => [optimisticStyle, ...(old || [])]);
      } else {
        queryClient.setQueryData(["style-dna"], (old) =>
          old?.map((s) =>
            s.id === editingStyle.id ? { ...s, ...data } : s
          )
        );
      }
      setShowCreate(false);
      setEditingStyle(null);
      resetForm();
      return { previousStyles };
    },
    onError: (_err, _data, context) => {
      if (context?.previousStyles) {
        queryClient.setQueryData(["style-dna"], context.previousStyles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["style-dna"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StyleDNA.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["style-dna"] });
      const previousStyles = queryClient.getQueryData(["style-dna"]);
      queryClient.setQueryData(["style-dna"], (old) => old?.filter((s) => s.id !== id));
      return { previousStyles };
    },
    onError: (_err, _id, context) => {
      if (context?.previousStyles) {
        queryClient.setQueryData(["style-dna"], context.previousStyles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["style-dna"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      genre: "cinematic",
      mood_settings: { energy: 50, complexity: 50, darkness: 30 },
      vocal_type: "none",
      bpm: 120,
      structure: ["intro", "verse", "chorus", "verse", "chorus", "outro"],
      is_public: false,
    });
  };

  const handleEdit = (style) => {
    setEditingStyle(style);
    setFormData({
      name: style.name,
      description: style.description || "",
      genre: style.genre,
      mood_settings: style.mood_settings || { energy: 50, complexity: 50, darkness: 30 },
      vocal_type: style.vocal_type || "none",
      bpm: style.bpm || 120,
      structure: style.structure || ["intro", "verse", "chorus", "outro"],
      is_public: style.is_public || false,
    });
    setShowCreate(true);
  };

  const applyStyle = (style) => {
    localStorage.setItem("applied_style_dna", JSON.stringify(style));
    window.location.href = "/Create";
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Dna className="w-6 h-6 text-blue-400" />
              <h1 className="text-3xl font-bold gradient-text">Style DNA</h1>
            </div>
            <p className="text-sm text-zinc-500">Save and reuse your signature music styles</p>
          </div>
          <Button
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="gradient-purple text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Style
          </Button>
        </motion.div>

        {/* Styles Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {styles.map((style) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{style.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{style.description}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(style.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-md bg-blue-500/15 text-blue-400">
                    {style.genre}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-zinc-500">
                    {style.bpm} BPM
                  </span>
                  <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-zinc-500">
                    {style.vocal_type?.replace("_", " ")}
                  </span>
                  {style.uses > 0 && (
                    <span className="text-xs px-2 py-1 rounded-md bg-cyan-500/15 text-cyan-400">
                      {style.uses} uses
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => applyStyle(style)}
                    className="flex-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded-xl"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Use Style
                  </Button>
                  <Button
                    onClick={() => handleEdit(style)}
                    variant="ghost"
                    className="text-zinc-400 hover:text-white rounded-xl"
                  >
                    Edit
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-strong border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingStyle ? "Edit Style DNA" : "Create Style DNA"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Style Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My YouTube Brand Sound"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this style..."
                  className="bg-white/5 border-white/10 h-20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Genre</label>
                <GenreSelector
                  selected={formData.genre}
                  onSelect={(g) => setFormData({ ...formData, genre: g })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Mood Settings</label>
                <div className="glass rounded-xl p-4">
                  <MoodSliders
                    values={formData.mood_settings}
                    onChange={(m) => setFormData({ ...formData, mood_settings: m })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Vocals</label>
                <VocalSelector
                  selected={formData.vocal_type}
                  onSelect={(v) => setFormData({ ...formData, vocal_type: v })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Structure</label>
                <StructureBuilder
                  structure={formData.structure}
                  onChange={(s) => setFormData({ ...formData, structure: s })}
                />
              </div>

              <Button
                onClick={() => saveMutation.mutate(formData)}
                disabled={!formData.name || saveMutation.isPending}
                className="w-full gradient-purple text-white rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingStyle ? "Update Style" : "Save Style"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}