"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Construction } from "lucide-react";

export default function OrderBrochureDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6 text-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm">Order Brochure</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Construction className="h-5 w-5 text-orange-500" />
              Order Brochure
            </DialogTitle>
            <DialogDescription>
              We're working hard to bring you this feature
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Construction className="h-16 w-16 text-orange-500" />
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">Under Construction</h3>
              <p className="text-muted-foreground text-sm">
                This feature is currently being developed. Please check back
                soon!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
