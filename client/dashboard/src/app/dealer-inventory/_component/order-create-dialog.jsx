import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import CustomerOrderForm from "@/components/forms/customer-order-form";

export function CustomerOrderCreateDialog({
  isOpen,
  setIsOpen,
  callback,
  vehicleId,
  customerId = null,
  maxSelect = null,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="sr-only">Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customer order?</DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
          <div>
            <CustomerOrderForm
              callback={callback}
              vehicleId={vehicleId}
              customerId={customerId}
              maxSelect={maxSelect}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
