"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import config from "@/config";
import Image from "next/image";

export function VehicleLaunchCard({
  title,
  subtitle,
  description,
  imageUrl,
  launchDate,
  ctaText = "RESERVE NOW",
  onCtaClick,
}) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 group overflow-hidden transition-all duration-300">
      {/* Vehicle Image */}
      <div className="relative aspect-[16/8] overflow-hidden">
        <Image
          width={200}
          height={200}
          src={`${config.file_base}${imageUrl}` || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="space-y-4 p-6">
        {subtitle && (
          <div className="text-primary text-sm font-medium tracking-wider uppercase">
            {subtitle}
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-foreground text-2xl leading-tight font-bold text-balance">
            {title}
          </h2>
          <p className="text-muted-foreground line-clamp-2 leading-relaxed text-pretty">
            {description}
          </p>
        </div>

        {/* <div className="pt-2">
          <Button
            onClick={onCtaClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full font-semibold tracking-wide transition-all duration-200 hover:scale-[1.02]"
          >
            {ctaText}
          </Button>
        </div> */}
      </div>
    </Card>
  );
}
