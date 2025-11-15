import AssignCustomerToDealerForm from "@/components/forms/assign-customer-to-dealer";
import DriverForm from "@/components/forms/driver-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DriverDetailsDialog({ isOpen, setIsOpen, mutation, id }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add driver details</DialogTitle>
          <DialogDescription className={"sr-only"}>
            Add driver details
          </DialogDescription>
          <div className="mt-2">
            <DriverForm updateMutation={mutation} id={id} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
