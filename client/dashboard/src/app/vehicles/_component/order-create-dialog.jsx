import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import OrderForm from "@/components/forms/dealer-inventory-form";

export function DealerOrderCreateDialog({
  isOpen,
  setIsOpen,
  createMutation,
  vehicleId,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="sr-only">Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to dealer?</DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
          <div>
            <OrderForm createMutation={createMutation} vehicleId={vehicleId} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
