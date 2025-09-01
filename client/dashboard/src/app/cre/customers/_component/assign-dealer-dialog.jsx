import AssignCustomerToDealerForm from "@/components/forms/assign-customer-to-dealer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AssignDealerDialog({
  isOpen,
  setIsOpen,
  mutation,
  customerId,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign dealer?</DialogTitle>
          <DialogDescription className={"sr-only"}>
            Assign dealer
          </DialogDescription>
          <div className="mt-2">
            <AssignCustomerToDealerForm
              createMutation={mutation}
              customerId={customerId}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
