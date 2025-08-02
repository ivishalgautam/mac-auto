import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import UpdateVehiclePriceForm from "@/components/forms/vehicle-price";

export function UpdatePriceDialog({ isOpen, setIsOpen, id }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="sr-only">Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update price</DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
          <div>
            <UpdateVehiclePriceForm id={id} callback={() => setIsOpen(false)} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
