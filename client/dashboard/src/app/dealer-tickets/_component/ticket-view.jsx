"use client";

import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import { useUpdateTicket } from "@/mutations/ticket-mutation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  CalendarDays,
  User,
  Phone,
  MapPin,
  Building2,
  Clock,
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
import { useGetDealerTicketDetails } from "@/mutations/dealer-ticket-mutation";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "resolved":
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
  const { data, isLoading, isError, error } = useGetDealerTicketDetails(id);
  const updateMutation = useUpdateTicket(id);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  // ✅ Normalize broken API responses
  const images = Array.isArray(data.images) ? data.images : [];
  const videos = Array.isArray(data.videos) ? data.videos : [];

  const resolvedAt = data.resolved_at || data.updated_at;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* ===== STATUS ===== */}
      <div className="space-y-1 text-end">
        <Badge className={`${getStatusColor(data.status)} capitalize`}>
          {data.status}
        </Badge>

        {data.status === "resolved" && resolvedAt && (
          <Muted className="text-xs">
            Resolved at: {moment(resolvedAt).format("DD MMM, YYYY hh:mm A")}
          </Muted>
        )}
      </div>

      {/* ===== HEADER ===== */}
      <div className="bg-primary text-primary-foreground rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">#{data.ticket_number}</h1>
            <p className="mt-1 opacity-80">{data.complaint_type}</p>
          </div>

          <Badge className={`${getStatusColor(data.status)} capitalize`}>
            {data.status}
          </Badge>
        </div>
      </div>

      {/* ===== COMPLAINT DETAILS ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-1 font-medium">Customer observation</h4>
            <p className="text-muted-foreground">{data.message || "N/A"}</p>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm">
              <strong>Complaint date:</strong>{" "}
              {moment(data.created_at).format("DD MMM YYYY HH:mm")}
            </span>
          </div>

          {data.expected_closure_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                <strong>Expected Closure:</strong>{" "}
                {moment(data.expected_closure_date).format("DD MMM YYYY")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== DEALERSHIP ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dealership Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium">
              {data.dealership_first_name || "N/A"}{" "}
              {data.dealership_last_name || ""}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-sm">{data.dealership_phone || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{data.dealership_location || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      {/* ===== IMAGES ===== */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square w-24 overflow-hidden rounded-md"
                >
                  <Image
                    src={`${config.file_base}/${image}`}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                    alt={`image-${index}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== VIDEOS ===== */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {videos.map((video, index) => (
                <video
                  key={index}
                  src={`${config.file_base}/${video}`}
                  controls
                  className="w-full rounded-md"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== STATUS UPDATE ===== */}
      {["admin", "cre"].includes(user?.role) && (
        <div className="space-y-2 pt-4">
          <Select
            value={data.status}
            onValueChange={(value) => updateMutation.mutate({ status: value })}
          >
            <SelectTrigger className="capitalize">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              {ticketStatus.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="capitalize"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {data.status === "resolved" && resolvedAt && (
            <Muted className="text-xs">
              Resolved at: {moment(resolvedAt).format("DD MMM, YYYY hh:mm A")}
            </Muted>
          )}
        </div>
      )}

      {/* <TicketUpdates ticketId={id} /> */}
    </div>
  );
}
