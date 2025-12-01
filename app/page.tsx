"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CardContainer,
  CardBody,
  CardItem,
} from "@/components/ui/aceternity/3d-card";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Facebook, Instagram, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import type { Product, Category } from "@/lib/types/database";

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Default gradient colors for categories that don't have a color set
const defaultCategoryColors = [
  "from-yellow-200 to-orange-200",
  "from-blue-200 to-purple-200",
  "from-pink-200 to-rose-200",
  "from-emerald-200 to-teal-200",
  "from-red-200 to-pink-200",
  "from-indigo-200 to-blue-200",
  "from-amber-200 to-yellow-200",
  "from-cyan-200 to-sky-200",
];

// Default icons for categories based on common category names/keywords
const defaultCategoryIcons: Record<string, string> = {
  women: "👗",
  clothing: "👕",
  fashion: "✨",
  beauty: "💄",
  electronics: "📱",
  home: "🏠",
  sports: "⚽",
  shoes: "👟",
  accessories: "👜",
  jewelry: "💍",
  kids: "🧸",
  baby: "👶",
  toys: "🎮",
  health: "💊",
  food: "🍕",
  virtual: "💻",
  industrial: "🏭",
  business: "💼",
  office: "📋",
  pet: "🐾",
  garden: "🌱",
  automotive: "🚗",
  tools: "🔧",
  books: "📚",
  music: "🎵",
  art: "🎨",
};

// Function to get icon for a category
const getCategoryIcon = (category: Category): string => {
  // If category has an icon, use it
  if (category.icon) return category.icon;

  // Try to match based on category name or slug
  const nameSlug = `${category.name} ${category.slug}`.toLowerCase();
  for (const [keyword, icon] of Object.entries(defaultCategoryIcons)) {
    if (nameSlug.includes(keyword)) {
      return icon;
    }
  }

  // Default fallback icon
  return "🛍️";
};

const socialLinks = [
  {
    name: "Facebook",
    url: "https://facebook.com/jinmiranarmy",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/jinmiranarmy/",
    icon: Instagram,
    color:
      "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@jinmiranarmy",
    icon: () => (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    color: "bg-gray-800/80 hover:bg-gray-900",
  },
];

// ============================================
// SECTION COMPONENTS
// ============================================

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function HomePage() {
  const socialRef = useRef<HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data and check auth state on mount
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        setIsLoggedIn(!!data.user);
        setUserEmail(data.user?.email);
      });

    // Fetch trending products (hot products or recent ones)
    supabase
      .from("products")
      .select("*")
      .order("is_hot", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (!error && data) {
          setTrendingProducts(data);
        }
      });

    // Fetch categories for "Shop by Mood"
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .limit(4)
      .then(({ data, error }) => {
        if (!error && data) {
          setCategories(data);
        }
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsLoggedIn(!!session?.user);
        setUserEmail(session?.user?.email);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSocial = () => {
    socialRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Custom Cursor */}
      <CustomCursor isLoggedIn={isLoggedIn} userEmail={userEmail} />

      <div className="flex flex-col min-h-screen">
        {/* ============================================ */}
        {/* SECTION A: HERO */}
        {/* ============================================ */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-yellow/10 via-white to-white">
          {/* Dot Pattern Background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle, #121212 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-brand-yellow/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-brand-yellow/20 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-accent-pink/20 rounded-full blur-2xl animate-pulse delay-1000" />

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              {/* Badge */}
              <motion.div variants={fadeInUp} className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-brand-black shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  The #1 Global Fan Community
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                variants={fadeInUp}
                className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-brand-black mb-6 leading-tight"
              >
                Approved by the
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">Queen of Expressions</span>
                  <span className="absolute bottom-2 left-0 right-0 h-4 bg-brand-yellow/50 -z-0 -rotate-1" />
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={fadeInUp}
                className="mx-auto max-w-2xl text-lg md:text-xl text-text-muted mb-10"
              >
                From viral squishy lamps to aesthetic baby fits. We curate the
                cutest finds loved by the Miran Army.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button asChild size="lg" className="text-base px-8 py-6">
                  <Link href="/shop">
                    Shop Viral Picks
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6"
                  onClick={scrollToSocial}
                >
                  Join the Family
                </Button>
              </motion.div>
            </AnimatedSection>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-brand-black/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-brand-black/50 rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* SECTION B: TRENDING PRODUCTS (3D Cards) */}
        {/* ============================================ */}
        <section id="trending" className="py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <motion.h2
                variants={fadeInUp}
                className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black mb-4"
              >
                Trending on the Feed 🔥
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-text-muted text-lg max-w-xl mx-auto"
              >
                The cutest picks that are breaking the internet right now
              </motion.p>
            </AnimatedSection>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-2xl aspect-square animate-pulse"
                  />
                ))}
              </div>
            ) : trendingProducts.length > 0 ? (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {trendingProducts.map((product) => (
                  <motion.div key={product.id} variants={scaleIn}>
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 block"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-brand-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-brand-yellow text-brand-black px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1">
                            View Deal
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                        {/* Hot badge */}
                        {product.is_hot && (
                          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            🔥 Hot
                          </div>
                        )}
                        {/* Discount badge */}
                        {product.discount_percent != null &&
                          product.discount_percent > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{Math.round(product.discount_percent)}%
                            </div>
                          )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-heading font-bold text-brand-black text-lg mb-1 line-clamp-2">
                          {product.title}
                        </h3>
                        {product.short_desc && (
                          <p className="text-text-muted text-sm mb-3 line-clamp-1">
                            {product.short_desc}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-accent-pink">
                              {product.currency || "$"}
                              {product.price?.toFixed(2)}
                            </span>
                            {product.original_price &&
                              product.original_price > (product.price || 0) && (
                                <span className="text-sm text-text-muted line-through">
                                  {product.currency || "$"}
                                  {product.original_price.toFixed(2)}
                                </span>
                              )}
                          </div>
                          {product.is_hot && (
                            <span className="text-xs bg-brand-yellow/20 text-brand-black px-2 py-1 rounded-full font-medium">
                              🔥 Hot
                            </span>
                          )}
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <p>No trending products yet. Check back soon!</p>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Button asChild variant="outline" size="lg">
                <Link href="/shop">
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION C: SHOP BY MOOD (Bento Grid) */}
        {/* ============================================ */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-brand-yellow/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <motion.h2
                variants={fadeInUp}
                className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black mb-4"
              >
                Shop by Mood 🎭
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-text-muted text-lg max-w-xl mx-auto"
              >
                Find the perfect product for every vibe
              </motion.p>
            </AnimatedSection>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-3xl bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {categories.map((category, index) => (
                  <motion.div key={category.slug} variants={scaleIn}>
                    <Link href={`/shop?category=${category.slug}`}>
                      <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative aspect-square rounded-3xl bg-gradient-to-br ${
                          category.color ||
                          defaultCategoryColors[
                            index % defaultCategoryColors.length
                          ]
                        } p-6 flex flex-col items-center justify-center cursor-pointer overflow-hidden group shadow-lg hover:shadow-xl transition-shadow`}
                      >
                        {/* Animated background decoration */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-4 right-4 w-16 h-16 bg-white/30 rounded-full blur-xl" />
                          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 rounded-full blur-lg" />
                        </div>

                        {/* Emoji/Icon */}
                        <span className="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          {getCategoryIcon(category)}
                        </span>

                        {/* Name - truncated if too long */}
                        <h3 className="font-heading text-lg md:text-xl font-bold text-brand-black text-center line-clamp-2 px-2">
                          {category.name}
                        </h3>

                        {/* Arrow */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight className="h-6 w-6 text-brand-black/70" />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <p>Categories coming soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION D: JOIN THE FAMILY (Socials) */}
        {/* ============================================ */}
        <section
          ref={socialRef}
          className="py-24 md:py-32 bg-brand-black relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-yellow/5 to-transparent rounded-full" />
          </div>

          {/* Floating hearts decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-brand-yellow/20 text-4xl"
                initial={{ y: "100vh", x: `${15 + i * 15}%`, opacity: 0 }}
                animate={{
                  y: "-10vh",
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  delay: i * 1.5,
                  ease: "linear",
                }}
              >
                💛
              </motion.div>
            ))}
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatedSection className="text-center mb-12">
              {/* Badge */}
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-brand-yellow" />
                <span className="text-brand-yellow text-sm font-medium">
                  30K+ Family Members
                </span>
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Join the{" "}
                <span className="text-brand-yellow relative">
                  Family
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <path
                      d="M2 8C50 2 150 2 198 8"
                      stroke="#FDE047"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                💛
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto"
              >
                Be the first to know about viral drops, exclusive deals, and
                behind-the-scenes content
              </motion.p>
            </AnimatedSection>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            >
              {socialLinks.map((social, index) => (
                <motion.div key={social.name} variants={scaleIn}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.03, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative rounded-3xl overflow-hidden"
                    >
                      {/* Card background with gradient */}
                      <div
                        className={`${social.color} p-8 min-h-[220px] flex flex-col items-center justify-center relative`}
                      >
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>

                        {/* Icon with glow */}
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <social.icon className="w-10 h-10 text-white" />
                          </div>
                        </div>

                        {/* Platform name */}
                        <span className="font-heading text-2xl font-bold text-white mb-1">
                          {social.name}
                        </span>

                        {/* Handle */}
                        <span className="text-white/60 text-sm mb-4">
                          @jinmiranarmy
                        </span>

                        {/* Follow button */}
                        <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-5 py-2 transition-colors border border-white/10">
                          <span className="text-white text-sm font-medium">
                            Follow
                          </span>
                          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  </a>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            ></motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
