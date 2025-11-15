"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  FileText,
  ShoppingCart,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import config from "@/config";
import { rupee } from "@/lib/Intl";
import Image from "next/image";
import Link from "next/link";
import { Muted } from "@/components/ui/typography";

export function VehicleCard({ vehicle, onOrderVehicle, onAssignToCustomer }) {
  const [image, setImage] = useState(
    `${config.file_base}${vehicle.carousel?.[0]}` ||
      "/landscape-placeholder.svg",
  );

  const totalActiveQuantity = Number(vehicle.active_quantity) ?? 0;

  const isNoStock = totalActiveQuantity === 0;
  const isLowStock = totalActiveQuantity > 0 && totalActiveQuantity < 3;

  return (
    <Card className="bg-card border-border overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
          {/* Left side - Image */}
          <div className="relative md:col-span-1 md:aspect-auto">
            <Image
              width={500}
              height={500}
              src={image}
              alt={vehicle.title}
              onError={() => setImage("/landscape-placeholder.svg")}
              className="aspect-video h-full w-full object-contain object-center"
            />

            {isNoStock ? (
              <Badge
                variant="destructive"
                className="absolute top-3 left-3 flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                No Stock
              </Badge>
            ) : isLowStock ? (
              <Badge className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-500 text-white hover:bg-yellow-500/90">
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </Badge>
            ) : null}
          </div>

          {/* Right side - Content */}
          <div className="flex flex-col justify-between px-2 md:col-span-2">
            <div className="space-y-4">
              {/* Vehicle Name and Price */}
              <div className="flex justify-between">
                <div className="flex flex-col text-lg">
                  <span className="font-medium">Active Units:</span>
                  <Link
                    href={`/dealer-inventory/${vehicle.id}/inventory?page=1&limit=10&status=active`}
                  >
                    <span className="text-accent hover:text-primary font-bold">
                      {vehicle.active_quantity} available
                    </span>
                  </Link>
                </div>
                <div>
                  <h3 className="text-card-foreground mb-2 text-xl font-semibold">
                    Model
                  </h3>
                  <div className="space-y-1">
                    <p className="text-primary font-bold">
                      {vehicle.title}
                      {/* {rupee.format(vehicle.dealer_price)} */}
                    </p>
                  </div>
                </div>
              </div>

              {/* Colors Available */}
              <div>
                <Label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Available Colors
                </Label>
                <div className="flex flex-wrap gap-2">
                  {vehicle.colors.length === 0 ? (
                    <Muted>Not available</Muted>
                  ) : (
                    vehicle.colors.map((color, ind) => (
                      <div
                        key={ind}
                        className="border-border size-8 rounded-full border"
                        style={{ backgroundColor: color.color_hex }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Stock Information */}
              {/* <div className="space-y-2">
                <Label className="text-muted-foreground text-base font-semibold">
                  Stock Information
                </Label>
                <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active:</span>
                    <Link
                      href={`/dealer-inventory/${vehicle.id}/inventory?page=1&limit=10&status=active`}
                    >
                      <span className="font-medium text-green-600">
                        {vehicle.active_quantity}
                      </span>
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inactive:</span>
                    <Link
                      href={`/dealer-inventory/${vehicle.id}/inventory?page=1&limit=10&status=inactive`}
                    >
                      <span className="font-medium text-orange-600">
                        {vehicle.inactive_quantity}
                      </span>
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sold:</span>
                    <Link
                      href={`/dealer-inventory/${vehicle.id}/inventory?page=1&limit=10&status=sold`}
                    >
                      <span className="font-medium text-blue-600">
                        {vehicle.sold_quantity}
                      </span>
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scrapped:</span>
                    <Link
                      href={`/dealer-inventory/${vehicle.id}/inventory?page=1&limit=10&status=scrapped`}
                    >
                      <span className="font-medium text-red-600">
                        {vehicle.scrapped_quantity}
                      </span>
                    </Link>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-span-full mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Specifications Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <FileText className="h-4 w-4" />
                    Specifications
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] max-w-2xl min-w-[70vw] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{vehicle.title} Specifications</DialogTitle>
                  </DialogHeader>
                  <Tabs
                    defaultValue={vehicle.specifications[0]?.tab_name}
                    className="w-full"
                  >
                    <TabsList className="flex w-full">
                      {vehicle.specifications.map((spec) => (
                        <TabsTrigger
                          key={spec.tab_name}
                          value={spec.tab_name}
                          className="text-xs"
                        >
                          {spec.tab_name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {vehicle.specifications.map((spec) => (
                      <TabsContent
                        key={spec.tab_name}
                        value={spec.tab_name}
                        className="space-y-3"
                      >
                        <div className="grid gap-3">
                          {spec.specs.map((item, index) => (
                            <div
                              key={index}
                              className="border-border flex items-start justify-between border-b py-2 last:border-b-0"
                            >
                              <Label className="text-sm font-medium">
                                {item.label}
                              </Label>
                              <p className="text-muted-foreground max-w-[60%] text-right text-sm">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </DialogContent>
              </Dialog>

              {/* Order Vehicle Modal */}
              {/* <Button
                className="flex items-center gap-2"
                onClick={() => onOrderVehicle?.()}
              >
                <ShoppingCart className="h-4 w-4" />
                Order
              </Button> */}
              {/* </div> */}

              {/* <div className="grid grid-cols-2 gap-3"> */}
              {/* Marketing Material Link */}
              <Button
                variant="outline"
                asChild
                className="flex items-center gap-2 bg-transparent"
              >
                <Link
                  href={`/marketing-materials?category=${vehicle.category}&vid=${vehicle.id}`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Marketing
                </Link>
              </Button>

              {/* Assign to Customer Modal */}
              {/* <Button
                variant="secondary"
                className="flex items-center gap-2"
                type="button"
                onClick={onAssignToCustomer}
              >
                <UserPlus className="h-4 w-4" />
                Assign to customer
              </Button> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
