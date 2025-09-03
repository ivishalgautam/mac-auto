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
  vehicleColorId = null,
  dealerId,
  maxSelect = null,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="sr-only">Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create dealer order?</DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div>
          <OrderForm
            createMutation={createMutation}
            vehicleId={vehicleId}
            dealerId={dealerId}
            maxSelect={maxSelect}
            vehicleColorId={vehicleColorId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
