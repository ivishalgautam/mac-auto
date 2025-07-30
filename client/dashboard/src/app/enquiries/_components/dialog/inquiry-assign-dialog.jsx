import InquiryAssignToDealerForm from "@/app/enquiries/_components/enquiry-assign-to-dealer-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InquiryAssignDialog({ isOpen, setIsOpen, inquiryId }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to dealer?</DialogTitle>
          <DialogDescription className={"sr-only"}>
            Assign to dealer
          </DialogDescription>
          <div className="mt-2">
            <InquiryAssignToDealerForm
              onSuccess={() => setIsOpen(false)}
              inquiryId={inquiryId}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
