import AssignCustomerToDealerForm from "@/components/forms/assign-customer-to-dealer";
import VehicleInquiryForm from "@/components/forms/vehicle-inquiry-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CreateDialog({ isOpen, setIsOpen }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign dealer?</DialogTitle>
          <DialogDescription className={"sr-only"}>
            Create Inquiry
          </DialogDescription>
          <div className="mt-2">
            <ScrollArea className="h-96">
              <VehicleInquiryForm onSuccess={() => setIsOpen(false)} />
            </ScrollArea>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
