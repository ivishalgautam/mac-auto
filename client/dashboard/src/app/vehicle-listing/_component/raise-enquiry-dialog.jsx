import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import RaiseVehicleEnquiryForm from "@/components/forms/raise-vehicle-enquiry";

export function RaiseEnquiryDialog({ isOpen, setIsOpen, vehicleId, callback }) {
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
            <RaiseVehicleEnquiryForm
              vehicleId={vehicleId}
              callback={callback}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
