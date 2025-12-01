"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { createClient } from "@/lib/supabase/client";

interface FavoriteButtonProps {
  productId: string;
  initialIsFavorite?: boolean;
  className?: string;
}

export function FavoriteButton({
  productId,
  initialIsFavorite = false,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        // Add to favorites
        await supabase.from("favorites").insert({
          user_id: user.id,
          product_id: productId,
        });
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "p-2 rounded-full transition-all",
          isFavorite
            ? "bg-accent-pink text-white"
            : "bg-white/80 backdrop-blur-sm text-text-muted hover:text-accent-pink hover:bg-white",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // After login, add to favorites
          setIsFavorite(true);
        }}
      />
    </>
  );
}
