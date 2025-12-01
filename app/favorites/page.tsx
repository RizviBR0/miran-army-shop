import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg-main">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-soft-pink mb-6">
            <Heart className="h-10 w-10 text-accent-pink" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main mb-3">
            Your Favorites Await! 💛
          </h1>
          <p className="text-text-muted mb-6">
            Sign in with your email to save and access your favorite Miran Army
            picks from anywhere.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/login">Sign in to View Favorites</Link>
          </Button>
          <p className="text-xs text-text-muted mt-4">
            No password required – we'll send you a magic link!
          </p>
        </div>
      </div>
    );
  }

  // TODO: Fetch user favorites from Supabase
  const favorites: any[] = []; // Will be populated from database

  if (favorites.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg-main">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="text-6xl mb-6">💛</div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main mb-3">
            No Favorites Yet
          </h1>
          <p className="text-text-muted mb-6">
            Start exploring our cute picks and tap the heart icon to save your
            favorites!
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-main">
              My Favorites 💛
            </h1>
            <p className="text-text-muted mt-1">
              {favorites.length} {favorites.length === 1 ? "item" : "items"}{" "}
              saved
            </p>
          </div>
        </div>

        {/* Favorites grid will go here */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {/* ProductCard components for favorites */}
        </div>
      </div>
    </div>
  );
}
