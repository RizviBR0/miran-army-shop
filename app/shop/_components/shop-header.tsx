"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, ShoppingBag, Zap } from "lucide-react";

export function ShopHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-black via-brand-black to-purple-900 text-white py-16 md:py-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-pink/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons */}
      <motion.div
        className="absolute top-10 left-[10%] text-brand-yellow/30"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-8 w-8" />
      </motion.div>
      <motion.div
        className="absolute top-20 right-[15%] text-accent-pink/30"
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Heart className="h-6 w-6" />
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-[20%] text-purple-400/30"
        animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <ShoppingBag className="h-7 w-7" />
      </motion.div>
      <motion.div
        className="absolute bottom-16 right-[10%] text-brand-yellow/30"
        animate={{ y: [0, 12, 0], rotate: [0, 10, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7,
        }}
      >
        <Zap className="h-5 w-5" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-brand-yellow" />
            <span className="text-sm font-medium">Curated Just For You</span>
          </motion.div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-brand-yellow to-accent-pink bg-clip-text text-transparent">
              Shop Miran Army
            </span>
            <br />
            <span className="text-white">Picks</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover curated AliExpress finds handpicked for fans.
            <br className="hidden md:block" />
            All products linked with{" "}
            <span className="text-brand-yellow">💛</span> for the best deals!
          </p>

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-brand-yellow">
                100+
              </div>
              <div className="text-xs text-white/60">Products</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent-pink">
                50%
              </div>
              <div className="text-xs text-white/60">Max Discount</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-400">
                Free
              </div>
              <div className="text-xs text-white/60">Shipping</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
