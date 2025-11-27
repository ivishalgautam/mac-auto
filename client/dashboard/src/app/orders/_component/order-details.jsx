"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  Package,
  User,
  Calendar,
  Truck,
  ExternalLink,
  Download,
  X,
} from "lucide-react";
import moment from "moment";
import { orderStatuses } from "../columns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { DriverDetailsDialog } from "./driver-details-dialog";
import { useUpdateOrder } from "@/mutations/use-orders";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import config from "@/config";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { ROLES } from "@/data/routes";

const statusConfig = {
  pending: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    icon: <Clock className="h-5 w-5" />,
    label: "Pending",
  },
  "in process": {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: <Package className="h-5 w-5" />,
    label: "In Process",
  },
  dispatched: {
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-900/20",
    icon: <Truck className="h-5 w-5" />,
    label: "Dispatched",
  },
  "out for delivery": {
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    icon: <Truck className="h-5 w-5" />,
    label: "Out For Delivery",
  },
  delivered: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    icon: <CheckCircle2 className="h-5 w-5" />,
    label: "Delivered",
  },
  cancel: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    icon: <X className="h-5 w-5" />,
    label: "Canceled",
  },
};

export default function OrderDetails({ data }) {
  const { user } = useAuth();

  const [id, setId] = useState(null);
  const [isDeliveryModal, setIsDeliveryModal] = useState(false);

  const updateMutation = useUpdateOrder(id, (data) => {
    toast(data?.message ?? "Updated");
    setIsDeliveryModal(false);
  });

  const currentStatus = statusConfig[data.status] || statusConfig.pending;

  const isDriverActive =
    data &&
    ["out for delivery", "delivered"].includes(data?.status) &&
    data?.driver_details;

  return (
    <div className="from-background to-muted/20 mb-4 bg-gradient-to-br">
      <div className="mx-auto space-y-4">
        {/* Status Overview Card */}
        <Card className="overflow-hidden border-0">
          <CardHeader className={`${currentStatus.bgColor} rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${currentStatus.bgColor}`}>
                  <div className={currentStatus.color}>
                    {currentStatus.icon}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Order Status
                  </p>
                  <p className={`text-2xl font-bold ${currentStatus.color}`}>
                    {currentStatus.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${currentStatus.bgColor} ${currentStatus.color} border-0 px-3 py-1 text-base`}
                >
                  {data.order_code}
                </Badge>
                <Select
                  value={data.status}
                  onValueChange={(value) => {
                    setId(data.id);
                    if (value === "out for delivery") {
                      return setIsDeliveryModal(true);
                    }
                    setTimeout(() => {
                      updateMutation.mutate({ status: value });
                    }, 0);
                  }}
                  disabled={
                    ![ROLES.ADMIN, ROLES.CRE, ROLES.MANAGER].includes(
                      user?.role,
                    )
                  }
                >
                  <SelectTrigger className={"capitalize"}>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((option) => {
                      const statusOrder = orderStatuses.map((o) => o.value);
                      const currentIndex = statusOrder.indexOf(data.status);
                      const optionIndex = statusOrder.indexOf(option.value);

                      const disabled =
                        optionIndex < currentIndex ||
                        ["cancel", "delivered"].includes(status);

                      return (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className={`flex items-center gap-2 capitalize`}
                          disabled={disabled}
                        >
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${option.color}`}
                          />
                          {option.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Details Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Order Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DetailRow label="Order Code" value={data.order_code} />
              <DetailRow label="Punch By" value={data.punch_by} />
              <DetailRow label="Dealer Name" value={data.dealer_name} />
              <DetailRow
                label="Status"
                value={
                  <span className={`font-semibold ${currentStatus.color}`}>
                    {currentStatus.label}
                  </span>
                }
              />
            </CardContent>
          </Card>

          {/* Driver details */}
          {isDriverActive && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Driver details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <DetailRow label="Phone" value={data.driver_details.phone} />
                <DetailRow
                  label="Driver Name"
                  value={data.driver_details.driver_name}
                />
                <DetailRow
                  label="Vehicle Number"
                  value={data.driver_details.vehicle_number}
                />
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card
            className={cn("col-span-2 border-0 shadow-sm", {
              "col-span-3": !isDriverActive,
            })}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="text-primary h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-full items-center justify-center gap-4 overflow-x-auto py-2">
                {orderStatuses.map((order) => {
                  const statusOrder = orderStatuses.map((o) => o.value);
                  const currentIndex = statusOrder.indexOf(data.status);
                  const optionIndex = statusOrder.indexOf(order.value);

                  const isActive = optionIndex <= currentIndex;

                  return (
                    <TimelineItem
                      key={order.value}
                      label={order.label}
                      date={moment(data.created_at).format("MMM DD, YYYY")}
                      isActive={isActive}
                      isHorizontal={true}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {data.status === "delivered" && (
          <div className="flex gap-2">
            {/* invoice */}
            <div>
              <Label>Invoice</Label>
              <div className="flex flex-wrap items-center justify-start gap-2">
                {data?.invoice?.map((file, index) => (
                  <div
                    key={index}
                    className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate">{file.split("\\").pop()}</span>
                      <a
                        href={`${config.file_base}/${file}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ size: "icon", variant: "outline" }),
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* pdi */}
            <div>
              <Label>PDI</Label>
              <div className="flex flex-wrap items-center justify-start gap-2">
                {data?.pdi?.map((file, index) => (
                  <div
                    key={index}
                    className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate">{file.split("\\").pop()}</span>
                      <a
                        href={`${config.file_base}/${file}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ size: "icon", variant: "outline" }),
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* e-way bill */}
            <div>
              <Label>E-Way Bill</Label>
              <div className="flex flex-wrap items-center justify-start gap-2">
                {data?.e_way_bill?.map((file, index) => (
                  <div
                    key={index}
                    className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate">{file.split("\\").pop()}</span>
                      <a
                        href={`${config.file_base}/${file}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ size: "icon", variant: "outline" }),
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Section */}
        {data.message && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{data.message}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DriverDetailsDialog
        mutation={updateMutation}
        isOpen={isDeliveryModal}
        setIsOpen={setIsDeliveryModal}
        id={id}
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="border-border flex items-center justify-between border-b pb-1 last:border-0 last:pb-0">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <span className="text-foreground text-sm font-semibold">{value}</span>
    </div>
  );
}

function TimelineItem({ label, date, isActive, isHorizontal = false }) {
  if (isHorizontal) {
    return (
      <div className="flex min-w-max flex-col items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${isActive ? "bg-emerald-500" : "bg-muted"} ring-2 ${isActive ? "ring-emerald-200 dark:ring-emerald-900" : "ring-border"}`}
        />
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs whitespace-nowrap">
          {date}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full ${isActive ? "bg-emerald-500" : "bg-muted"} ring-2 ${isActive ? "ring-emerald-200 dark:ring-emerald-900" : "ring-border"}`}
        />
        <div className="bg-border mt-2 h-12 w-0.5" />
      </div>
      <div className="pb-8">
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{date}</p>
      </div>
    </div>
  );
}
