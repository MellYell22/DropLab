import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Download, Play, Heart, Music, Dna, ShoppingBag, Users, Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ["analytics-tracks"],
    queryFn: () => base44.entities.Track.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: styles = [], isLoading: stylesLoading } = useQuery({
    queryKey: ["analytics-styles"],
    queryFn: () => base44.entities.StyleDNA.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["analytics-purchases"],
    queryFn: () => base44.entities.Purchase.filter({ seller_id: user?.id }),
    enabled: !!user,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["analytics-items"],
    queryFn: () => base44.entities.MarketplaceItem.filter({ seller_id: user?.id }),
    enabled: !!user,
  });

  if (!user || tracksLoading || stylesLoading || purchasesLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  const totalRevenue = purchases.reduce((sum, p) => sum + (p.creator_revenue || 0), 0);
  const totalSales = purchases.length;
  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);
  const totalLikes = tracks.reduce((sum, t) => sum + (t.likes || 0), 0);
  const totalDownloads = tracks.reduce((sum, t) => sum + ((t.plays || 0) * 0.3), 0); // Estimate
  const avgRating = items.length > 0 
    ? (items.reduce((sum, i) => sum + (i.rating || 0), 0) / items.length).toFixed(1)
    : 0;

  const topTracks = [...tracks]
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, 5);

  const topStyles = [...styles]
    .sort((a, b) => (b.uses || 0) - (a.uses || 0))
    .slice(0, 5);

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/15" },
    { label: "Total Sales", value: totalSales, icon: ShoppingBag, color: "text-violet-400", bg: "bg-violet-500/15" },
    { label: "Total Plays", value: totalPlays.toLocaleString(), icon: Play, color: "text-blue-400", bg: "bg-blue-500/15" },
    { label: "Total Likes", value: totalLikes, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/15" },
    { label: "Downloads", value: Math.floor(totalDownloads), icon: Download, color: "text-amber-400", bg: "bg-amber-500/15" },
    { label: "Avg Rating", value: avgRating, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/15" },
  ];

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-6 h-6 text-violet-400" />
              <h1 className="text-3xl font-bold gradient-text">Creator Analytics</h1>
            </div>
            <p className="text-sm text-zinc-500">Track your performance and earnings</p>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "all"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range
                    ? "bg-violet-500/20 text-violet-300"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {range === "all" ? "All Time" : range}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4"
              >
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tracks */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-violet-400" />
                Top Performing Tracks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTracks.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No tracks yet</p>
              ) : (
                topTracks.map((track, i) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-lg font-bold text-zinc-600 w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{track.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {track.plays || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {track.likes || 0}
                        </span>
                      </div>
                    </div>
                    <div className="h-8 w-24 flex items-end gap-0.5">
                      {[...Array(7)].map((_, j) => (
                        <div
                          key={j}
                          className="flex-1 bg-violet-500/30 rounded-sm"
                          style={{ height: `${20 + Math.random() * 80}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Style DNA */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Dna className="w-4 h-4 text-emerald-400" />
                Popular Style DNA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topStyles.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No styles yet</p>
              ) : (
                topStyles.map((style, i) => (
                  <div key={style.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-lg font-bold text-zinc-600 w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{style.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                          {style.genre}
                        </span>
                        <span className="text-xs text-zinc-500">{style.uses || 0} uses</span>
                      </div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Performance */}
        {items.length > 0 && (
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-violet-400" />
                Marketplace Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="glass-strong rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        <p className="text-[10px] text-zinc-500 mt-1">{item.type?.replace("_", " ")}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">${item.price}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                      <div>
                        <p className="text-xs text-zinc-600">Sales</p>
                        <p className="text-sm font-bold text-white">{item.sales || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600">Rating</p>
                        <p className="text-sm font-bold text-white">{item.rating || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600">Revenue</p>
                        <p className="text-sm font-bold text-emerald-400">
                          ${((item.sales || 0) * item.price * (item.revenue_share / 100)).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Breakdown */}
        {purchases.length > 0 && (
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {purchases.slice(-10).reverse().map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm text-white">Item ID: {purchase.item_id?.slice(0, 8)}...</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {new Date(purchase.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">+${purchase.creator_revenue?.toFixed(2)}</p>
                      <p className="text-xs text-zinc-500">${purchase.amount?.toFixed(2)} total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}