import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Check, Loader2, CreditCard, ArrowRight, Shield } from "lucide-react";

const creditPackages = [
  { id: "price_basic", name: "10 Credits", price: 5, credits: 10, popular: false, color: "from-blue-500 to-purple-500", priceId: "price_1Tka3SGDw0P2L0A1piscjECa" },
  { id: "price_popular", name: "50 Credits", price: 20, credits: 50, popular: true, color: "from-cyan-500 to-teal-500", priceId: "price_1Tka5kGDw0P2L0A1vpHLOv6Y" },
  { id: "price_pro", name: "150 Credits", price: 50, credits: 150, popular: false, color: "from-amber-500 to-orange-500", priceId: "price_1Tka8AGDw0P2L0A1dBwqemKK" },
];

export default function CreditStore() {
  const [checkingOut, setCheckingOut] = useState(null);
  const [error, setError] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const handleCheckout = async (pkg) => {
    setCheckingOut(pkg.id);
    setError(null);

    if (window.self !== window.top) {
      setError("Checkout works only from a published app. Please open this page directly.");
      setCheckingOut(null);
      return;
    }

    try {
      const result = await base44.functions.invoke("createStripeCheckout", {
        packageId: pkg.id,
        credits: pkg.credits,
        amount: pkg.price,
        successUrl: `${window.location.origin}/Credits?success=true`,
        cancelUrl: `${window.location.origin}/Credits?canceled=true`,
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      if (err.message?.includes("function not found") || err.message?.includes("not accessible")) {
        setError("Stripe checkout requires a Builder+ subscription. Upgrade your plan to enable payments.");
      } else {
        setError("Could not start checkout. Please try again.");
      }
      setCheckingOut(null);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get("success") === "true";
  const isCanceled = urlParams.get("canceled") === "true";

  if (isSuccess && user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-16 p-8 glass rounded-2xl text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
        <p className="text-zinc-400">Your credits have been added to your account.</p>
        <p className="text-lg font-bold text-white">
          Balance: <span className="text-cyan-400">{user.credits || 0} credits</span>
        </p>
        <button
          onClick={() => window.location.href = "/Marketplace"}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-purple text-white font-medium"
        >
          Browse Marketplace <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-blue-300 mb-4">
            <Sparkles className="w-3 h-3" />
            Secure Payments via Stripe
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Buy Credits</h1>
          <p className="text-zinc-400 max-w-md mx-auto">
            Credits let you purchase music styles, templates, and voice packs from the marketplace.
          </p>
          {user && (
            <p className="text-sm text-zinc-500 mt-2">
              Current balance: <span className="text-blue-400 font-medium">{user.credits || 0} credits</span>
            </p>
          )}
        </motion.div>

        {isCanceled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"
          >
            <p className="text-sm text-amber-400">Checkout was canceled. No charges were made.</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
          >
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {creditPackages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-2xl p-6 space-y-5 relative ${
                pkg.popular ? "ring-2 ring-cyan-500/50 scale-[1.02]" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">
                  BEST VALUE
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-white">${pkg.price}</span>
                  <span className="text-sm text-zinc-500"> one-time</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  ${(pkg.price / pkg.credits).toFixed(2)} per credit
                </p>
              </div>

              <div className={`h-1 rounded-full bg-gradient-to-r ${pkg.color}`} />

              <div className="space-y-2">
                {[
                  `${pkg.credits} credits added to account`,
                  "Use on any marketplace item",
                  "Credits never expire",
                  "Secure Stripe checkout",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs text-zinc-400">{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(pkg)}
                disabled={checkingOut === pkg.id || !!checkingOut}
                className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all ${
                  pkg.popular
                    ? "bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/25"
                    : "gradient-purple hover:shadow-lg hover:shadow-blue-500/25"
                } disabled:opacity-50 min-h-[44px]`}
              >
                {checkingOut === pkg.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Buy Now
                  </span>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="max-w-md mx-auto mt-8">
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="text-xs text-zinc-500">
              Payments are processed securely through Stripe. Your card details are never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}