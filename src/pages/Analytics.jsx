import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Download, Play, Heart, Music, Dna, ShoppingBag, Star, Loader2, Trash2, AlertTriangle, User, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
// Card components replaced with dark glass divs for consistent dark theme
import PullToRefresh from "../components/shared/PullToRefresh";
import DashboardTrackList from "../components/analytics/DashboardTrackList";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null); // 'success' | 'error' | null
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ["analytics-tracks"],
    queryFn: () => base44.entities.Track.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const { data: styles = [], isLoading: stylesLoading } = useQuery({
    queryKey: ["analytics-styles"],
    queryFn: () => base44.entities.StyleDNA.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["analytics-purchases"],
    queryFn: () => base44.entities.Purchase.filter({ seller_id: user?.id }),
    enabled: !!user
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["analytics-items"],
    queryFn: () => base44.entities.MarketplaceItem.filter({ seller_id: user?.id }),
    enabled: !!user
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics-tracks"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-styles"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-purchases"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-items"] });
  };

  if (!user || tracksLoading || stylesLoading || purchasesLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>);

  }

  const rangeDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : null;
  const rangeStart = rangeDays ? moment().subtract(rangeDays, "days") : null;
  const filteredTracks = rangeStart ? tracks.filter(t => moment(t.created_date).isAfter(rangeStart)) : tracks;
  const filteredPurchases = rangeStart ? purchases.filter(p => moment(p.created_date).isAfter(rangeStart)) : purchases;

  const totalRevenue = filteredPurchases.reduce((sum, p) => sum + (p.creator_revenue || 0), 0);
  const totalSales = filteredPurchases.length;
  const totalPlays = filteredTracks.reduce((sum, t) => sum + (t.plays || 0), 0);
  const totalLikes = filteredTracks.reduce((sum, t) => sum + (t.likes || 0), 0);
  const totalDownloads = filteredTracks.reduce((sum, t) => sum + (t.plays || 0) * 0.3, 0); // Estimate
  const avgRating = items.length > 0 ?
  (items.reduce((sum, i) => sum + (i.rating || 0), 0) / items.length).toFixed(1) :
  0;

  // Build daily revenue chart data for selected range
  const dailyRevenue = (() => {
    const numDays = rangeDays || 30;
    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      days.push({ date, revenue: 0 });
    }
    filteredPurchases.forEach((p) => {
      const day = moment(p.created_date).format("YYYY-MM-DD");
      const entry = days.find((d) => d.date === day);
      if (entry) entry.revenue += p.creator_revenue || 0;
    });
    return days.map((d) => ({ ...d, label: moment(d.date).format("MMM D") }));
  })();

  const hasRevenueData = dailyRevenue.some((d) => d.revenue > 0);

  const topTracks = [...filteredTracks].
  sort((a, b) => (b.plays || 0) - (a.plays || 0)).
  slice(0, 5);

  const topStyles = [...styles].
  sort((a, b) => (b.uses || 0) - (a.uses || 0)).
  slice(0, 5);

  const stats = [
  { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/15" },
  { label: "Total Sales", value: totalSales, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/15" },
  { label: "Total Plays", value: totalPlays.toLocaleString(), icon: Play, color: "text-blue-400", bg: "bg-blue-500/15" },
  { label: "Total Likes", value: totalLikes, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/15" },
  { label: "Downloads", value: Math.floor(totalDownloads), icon: Download, color: "text-amber-400", bg: "bg-amber-500/15" },
  { label: "Avg Rating", value: avgRating, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/15" }];


  return (
    <div className="min-h-screen pb-32">
      <PullToRefresh onRefresh={handleRefresh} isLoading={tracksLoading || stylesLoading || purchasesLoading || itemsLoading}>
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* Header */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between">
            
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <h1 className="text-3xl font-bold gradient-text text-[#3fdec7]">Creator Analytics</h1>
            </div>
            <p className="text-sm text-zinc-500">Track your performance and earnings</p>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "all"].map((range) =>
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range ?
                "bg-blue-500/20 text-blue-300" :
                "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`
                }>
                
                {range === "all" ? "All Time" : range}
              </button>
              )}
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
                  className="glass rounded-xl p-4">
                  
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </motion.div>);

            })}
        </div>

        {/* Revenue Trend Chart */}
        <div className="glass rounded-2xl border border-white/[0.06]">
          <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Revenue Trend — Last 30 Days
            </h3>
          </div>
          <div className="p-5">
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d0d14",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: "12px",
                      fontSize: "13px",
                    }}
                    formatter={(value) => ["$" + Number(value).toFixed(2), "Revenue"]}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-12">No revenue data yet. Start selling to see your earnings trend.</p>
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tracks */}
          <div className="glass rounded-2xl border border-white/[0.06]">
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-blue-400" />
                Top Performing Tracks
              </h3>
            </div>
            <div className="p-4 space-y-1">
              {topTracks.length === 0 ?
                <p className="text-sm text-zinc-600 text-center py-8">No tracks yet</p> :
                topTracks.map((track, i) =>
                <div key={track.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                    <span className="text-sm font-bold text-zinc-600 w-5 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{track.title}</p>
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
                    <div className="h-8 w-20 flex items-end gap-0.5">
                      {[...Array(7)].map((_, j) =>
                        <div key={j} className="flex-1 bg-blue-500/30 rounded-sm" style={{ height: (20 + Math.random() * 80) + "%" }} />
                      )}
                    </div>
                  </div>
                )
              }
            </div>
          </div>

          {/* Top Style DNA */}
          <div className="glass rounded-2xl border border-white/[0.06]">
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Dna className="w-4 h-4 text-cyan-400" />
                Popular Style DNA
              </h3>
            </div>
            <div className="p-4 space-y-1">
              {topStyles.length === 0 ?
                <p className="text-sm text-zinc-600 text-center py-8">No styles yet</p> :
                topStyles.map((style, i) =>
                <div key={style.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                    <span className="text-sm font-bold text-zinc-600 w-5 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{style.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400">
                          {style.genre}
                        </span>
                        <span className="text-xs text-zinc-500">{style.uses || 0} uses</span>
                      </div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* Full Track Library */}
        <div className="glass rounded-2xl border border-white/[0.06]">
          <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-blue-400" />
              Track Library
              <span className="text-xs text-zinc-600 font-normal ml-1">({tracks.length} tracks)</span>
            </h3>
          </div>
          <div className="p-4">
            <DashboardTrackList tracks={[...tracks].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))} />
          </div>
        </div>

        {/* Marketplace Performance */}
        {items.length > 0 &&
          <div className="glass rounded-2xl border border-white/[0.06]">
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                Marketplace Items
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) =>
                <div key={item.id} className="glass-strong rounded-xl p-4 space-y-3 border border-white/[0.05]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-zinc-100">{item.title}</h4>
                        <p className="text-xs text-zinc-500 mt-1">{item.type?.replace("_", " ")}</p>
                      </div>
                      <span className="text-xs font-bold text-cyan-400">${item.price}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                      <div>
                        <p className="text-xs text-zinc-600">Sales</p>
                        <p className="text-sm font-bold text-zinc-100">{item.sales || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600">Rating</p>
                        <p className="text-sm font-bold text-zinc-100">{item.rating || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600">Revenue</p>
                        <p className="text-sm font-bold text-cyan-400">
                          ${((item.sales || 0) * item.price * (item.revenue_share / 100)).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          }

        {/* Revenue Breakdown */}
        {purchases.length > 0 &&
          <div className="glass rounded-2xl border border-white/[0.06]">
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Recent Sales
              </h3>
            </div>
            <div className="p-4 space-y-1">
              {purchases.slice(-10).reverse().map((purchase) =>
              <div key={purchase.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200">Item ID: {purchase.item_id?.slice(0, 8)}...</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(purchase.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">+${purchase.creator_revenue?.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">${purchase.amount?.toFixed(2)} total</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          }

        {/* Profile / Account Section */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" />
            Account
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
              <div>
                <p className="text-sm text-white">{user.full_name || "User"}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5">
            <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </div>
        </div>

        {/* Delete Account Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteConfirm &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
              style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))", paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
              onClick={() => setShowDeleteConfirm(false)}>
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-6 max-w-sm w-full space-y-4 border border-white/10">
                
                {deleteStatus === "success" ?
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Account Deleted</h3>
                    <p className="text-sm text-zinc-400 mt-2">
                      Your account and all associated data have been permanently removed. Redirecting...
                    </p>
                  </div> :
                deleteStatus === "error" ?
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-3">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Deletion Failed</h3>
                    <p className="text-sm text-zinc-400 mt-2">
                      Something went wrong while deleting your account. Please try again.
                    </p>
                    <button
                    onClick={() => {setDeleteStatus(null);setDeleting(false);}}
                    className="mt-4 py-2.5 px-6 rounded-xl text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 transition-colors">
                    
                      Close
                    </button>
                  </div> :

                <>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                      <p className="text-sm text-zinc-400 mt-2">
                        This action is permanent. All your data, tracks, styles, and purchases will be permanently removed.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 transition-colors">
                      
                        Cancel
                      </button>
                      <button
                      onClick={async () => {
                        setDeleting(true);
                        try {
                          for (const track of tracks) {
                            await base44.entities.Track.delete(track.id);
                          }
                          for (const style of styles) {
                            await base44.entities.StyleDNA.delete(style.id);
                          }
                          for (const item of items) {
                            await base44.entities.MarketplaceItem.delete(item.id);
                          }
                          const collabs = await base44.entities.Collaboration.filter({ created_by: user.email });
                          for (const c of collabs) {
                            await base44.entities.Collaboration.delete(c.id);
                          }
                          const videos = await base44.entities.VideoProject.filter({ created_by: user.email });
                          for (const v of videos) {
                            await base44.entities.VideoProject.delete(v.id);
                          }
                          const versions = await base44.entities.TrackVersion.filter({ created_by: user.email });
                          for (const v of versions) {
                            await base44.entities.TrackVersion.delete(v.id);
                          }
                          setDeleteStatus("success");
                          setTimeout(async () => {
                            await base44.auth.logout("/");
                          }, 1200);
                        } catch (e) {
                          setDeleteStatus("error");
                          setDeleting(false);
                        }
                      }}
                      disabled={deleting}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 min-h-[44px]">
                      
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                }
              </motion.div>
            </motion.div>
            }
        </AnimatePresence>
      </div>
      </PullToRefresh>
    </div>);

}