import InquiryToCustomerForm from "@/app/enquiries/_components/inquiry-to-customer-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConvertDialog({ isOpen, setIsOpen, inquiryId, selectedEnq }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to customer?</DialogTitle>
          <DialogDescription className={"sr-only"}>
            Convert to customer
          </DialogDescription>
          <div className="mt-2">
            <InquiryToCustomerForm
              onSuccess={() => setIsOpen(false)}
              inquiryId={inquiryId}
              selectedEnq={selectedEnq}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
