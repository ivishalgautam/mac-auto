"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, TicketX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card } from "@/components/ui/card";
import TicketUpdateForm from "@/components/forms/ticket-updates-form";
import {
  useCreateTicketUpdate,
  useTicketsUpdatesByTicket,
} from "@/mutations/use-ticket-updates";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import { Muted, Small } from "@/components/ui/typography";

export default function TicketUpdates({ ticketId, dealerTicketId }) {
  const [open, setOpen] = useState(false);
  const {
    data: updates,
    isLoading,
    isError,
    error,
  } = useTicketsUpdatesByTicket(ticketId || dealerTicketId);
  const createMutation = useCreateTicketUpdate(() => setOpen(false));
  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <div className="text-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Update
        </Button>
      </div>

      {updates.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TicketX />
            </EmptyMedia>
            <EmptyTitle>No updates yet</EmptyTitle>
            <EmptyDescription>
              Add the first update to this ticket to get started
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={() => setOpen(true)}>
              Add Update
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className="p-4">
              <Small className="mb-2 text-lg font-semibold">
                {update.title}
              </Small>
              <Muted className="mb-3 text-gray-600">{update.description}</Muted>
              <p className="text-sm text-gray-400">
                {new Date(update.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ticket Update</DialogTitle>
          </DialogHeader>
          <TicketUpdateForm
            ticketId={ticketId}
            dealerTicketId={dealerTicketId}
            createMutation={createMutation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
