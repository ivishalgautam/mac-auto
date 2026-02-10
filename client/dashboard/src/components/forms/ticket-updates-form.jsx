"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// --- Zod schema ---
export const ticketUpdateSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  ticket_id: z
    .string({ required_error: "required*" })
    .uuid()
    .optional()
    .nullable(),
  dealer_ticket_id: z
    .string({ required_error: "required*" })
    .uuid()
    .optional()
    .nullable(),
});

const defaultValues = {
  title: "",
  description: "",
};

export default function TicketUpdateForm({
  ticketId,
  dealerTicketId,
  createMutation,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketUpdateSchema),
    defaultValues: {
      ticket_id: ticketId ?? null,
      dealer_ticket_id: dealerTicketId ?? null,
    },
  });

  const onSubmit = async (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          type="text"
          placeholder="Enter update title"
          {...register("title")}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Mac Observation</Label>
        <Textarea
          placeholder="Enter observation"
          {...register("description")}
          className={errors.description ? "border-red-500" : ""}
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Add Update
        </Button>
      </div>
    </form>
  );
}
