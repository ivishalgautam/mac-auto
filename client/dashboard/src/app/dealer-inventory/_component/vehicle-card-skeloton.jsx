import { Card, CardContent } from "@/components/ui/card";

export function VehicleCardSkeleton() {
  return (
    <Card className="bg-card border-border animate-pulse overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          {/* Left side - Image Skeleton */}
          <div className="relative aspect-[4/3] md:aspect-auto">
            <div className="bg-muted h-full w-full" />
            {/* Low stock badge skeleton */}
            <div className="absolute top-3 left-3">
              <div className="bg-muted-foreground/20 h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* Right side - Content Skeleton */}
          <div className="flex flex-col justify-between p-6">
            <div className="space-y-4">
              {/* Vehicle Name and Price Skeleton */}
              <div>
                <div className="bg-muted mb-2 h-6 w-3/4 rounded" />
                <div className="space-y-1">
                  <div className="bg-muted h-8 w-1/2 rounded" />
                  <div className="bg-muted h-4 w-2/3 rounded" />
                </div>
              </div>

              {/* Colors Available Skeleton */}
              <div>
                <div className="bg-muted mb-2 h-4 w-24 rounded" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-muted h-6 w-16 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Stock Information Skeleton */}
              <div className="space-y-2">
                <div className="bg-muted h-4 w-28 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="bg-muted h-3 w-12 rounded" />
                      <div className="bg-muted h-3 w-6 rounded" />
                    </div>
                  ))}
                </div>
                <div className="border-border border-t pt-1">
                  <div className="flex justify-between">
                    <div className="bg-muted h-4 w-20 rounded" />
                    <div className="bg-muted h-4 w-24 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted h-9 rounded" />
                <div className="bg-muted h-9 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted h-9 rounded" />
                <div className="bg-muted h-9 rounded" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
