import RaiseVehicleEnquiryForm from "@/components/forms/raise-vehicle-enquiry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UpdateDialog({ isOpen, setIsOpen, id, callback }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update</DialogTitle>
          <DialogDescription className={"sr-only"}>update</DialogDescription>
        </DialogHeader>

        <div>
          <RaiseVehicleEnquiryForm type="edit" id={id} callback={callback} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
