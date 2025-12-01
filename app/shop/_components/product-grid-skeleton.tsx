import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="relative">
            <Skeleton className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-50" />
            {/* Badge placeholder */}
            <div className="absolute top-3 left-3">
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="absolute top-3 right-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
            <div className="flex items-center gap-1 pt-1">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-3.5 w-3.5 rounded" />
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
