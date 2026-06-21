import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Download, TrendingUp, Filter, Search, Music, Mic2, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PullToRefresh from "../components/shared/PullToRefresh";

const typeIcons = {
  style: Music,
  template: FileText,
  voice_pack: Mic2,
};

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["marketplace-items"],
    queryFn: () => base44.entities.MarketplaceItem.filter({ is_active: true }, "-created_date", 100),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (item) => {
      const user = await base44.auth.me();
      await base44.entities.Purchase.create({
        item_id: item.id,
        buyer_id: user.id,
        seller_id: item.seller_id,
        amount: item.price,
        creator_revenue: (item.price * item.revenue_share) / 100,
        platform_revenue: (item.price * (100 - item.revenue_share)) / 100,
      });
      await base44.entities.MarketplaceItem.update(item.id, {
        sales: (item.sales || 0) + 1,
      });
    },
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ["marketplace-items"] });
      const previousItems = queryClient.getQueryData(["marketplace-items"]);
      queryClient.setQueryData(["marketplace-items"], (old) =>
        old?.map((i) =>
          i.id === item.id ? { ...i, sales: (i.sales || 0) + 1 } : i
        )
      );
      return { previousItems };
    },
    onError: (_err, _item, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["marketplace-items"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-items"] });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["marketplace-items"] });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 radial-glow"
          style={{
            background: "linear-gradient(135deg, rgba(108,92,231,0.10), rgba(90,75,209,0.06))",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Marketplace</h1>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              Buy and sell unique music styles, templates, and voice packs. Earn from your creations.
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search marketplace..."
              className="pl-9 bg-white/5 border-white/10 h-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "style", "template", "voice_pack"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  typeFilter === type
                    ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {type === "all" ? "All" : type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <PullToRefresh onRefresh={handleRefresh} isLoading={isLoading}>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 space-y-4 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                        <p className="text-[10px] text-zinc-500">
                          {item.sales || 0} sales
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-0">
                      {item.price} credits
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>

                  {item.tags && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => purchaseMutation.mutate(item)}
                    disabled={purchaseMutation.isPending}
                    className="w-full gradient-purple text-white rounded-xl"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Purchase
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
        </PullToRefresh>
      </div>
    </div>
  );
}