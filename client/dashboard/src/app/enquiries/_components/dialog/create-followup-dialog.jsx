import FollowUpForm from "@/components/forms/followup-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateFollowupDialog({
  isOpen,
  setIsOpen,
  enquiryId,
  id,
  type,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Follow Up</DialogTitle>
          <DialogDescription className={"sr-only"}>
            Create Follow Up
          </DialogDescription>
          <div className="mt-2">
            <FollowUpForm
              enquiryId={enquiryId}
              onSuccess={() => setIsOpen(false)}
              id={id}
              type={type}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
