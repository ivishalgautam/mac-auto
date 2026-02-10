"use client";

import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import ErrorMessage from "@/components/ui/error";
import {
  useGetTicketDetails,
  useUpdateTicket,
} from "@/mutations/ticket-mutation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CalendarDays,
  User,
  Phone,
  MapPin,
  Wrench,
  Package,
  Building2,
  Clock,
  EyeIcon,
} from "lucide-react";
import moment from "moment";
import config from "@/config";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ticketStatus } from "./table-actions";
import { useAuth } from "@/providers/auth-provider";
import { Muted } from "@/components/ui/typography";
import TicketUpdates from "../../../components/ticket-updates";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function TicketView({ id }) {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useGetTicketDetails(id);
  const updateMutation = useUpdateTicket(id);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">#{data.ticket_number}</h1>
            <p className="text-primary-foreground/80 mt-1">
              {data.complaint_type}
            </p>
          </div>
          <Badge className={`${getStatusColor(data.status)} font-medium`}>
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Complaint Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Complaint Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2">
            <div>
              <h4 className="text-card-foreground mb-2 font-medium">
                Customer observation
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {data.message}
              </p>
            </div>
            <div>
              <h4 className="text-card-foreground mb-2 font-medium">
                Mac observation
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {data.mac_message}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">
                <strong>Filed:</strong>{" "}
                {moment(data.created_at).format("DD MMM YYYY HH:mm")}
              </span>
            </div>
            {data.expected_closure_date && (
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">
                  <strong>Expected Closure:</strong>{" "}
                  {data.expected_closure_date
                    ? moment(data.expected_closure_date).format("DD MMM YYYY")
                    : "N/a"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parts Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Parts Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap space-y-2">
            {data.parts.map((part, index) => (
              <Badge key={index} variant={"outline"}>
                {part.part_name ?? part.text}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technician Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assigned Technician
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full">
              <User className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <h4 className="text-card-foreground font-medium capitalize">
                {data.assigned_technician_name}
              </h4>
              <Muted>{data.assigned_technician_phone}</Muted>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer & Dealer Information Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-card-foreground font-medium">
                {data.customer_first_name} {data.customer_last_name || ""}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <Muted>Phone:</Muted>
              <span className="text-sm">{data.customer_phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <Muted>State:</Muted>
              <span className="text-sm">{data.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Muted>City:</Muted>
              <span className="text-sm">{data.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Muted>Address:</Muted>
              <span className="text-sm">{data.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dealership Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dealership Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-card-foreground font-medium">
                {data.dealership_first_name} {data.dealership_last_name}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">{data.dealership_phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <Muted>State:</Muted>
              <span className="text-sm">{data.dealership_state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Muted>City:</Muted>
              <span className="text-sm">{data.dealership_city}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">{data.dealership_location}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Images Section */}
      {data.images && data.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {data.images.map((image, index) => (
                <div
                  className="bg-accent group relative aspect-square w-24 rounded-md"
                  key={index}
                >
                  <Image
                    src={`${config.file_base}/${image}`}
                    width={200}
                    height={200}
                    className="size-full rounded-[inherit] object-cover"
                    alt={`carousel-${index}`}
                  />

                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <a
                      target="_blank"
                      className={buttonVariants({
                        size: "icon",
                        variant: "ghost",
                      })}
                      href={`${config.file_base}/${image}`}
                    >
                      <EyeIcon className="size-5 text-white" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {["admin", "cre"].includes(user?.role) && (
        <div className="flex gap-4 pt-4">
          <Select
            value={data.status}
            onValueChange={(value) => {
              updateMutation.mutate({ status: value });
            }}
          >
            <SelectTrigger className={"capitalize"}>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {ticketStatus.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={"capitalize"}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <TicketUpdates ticketId={id} />
    </div>
  );
}
