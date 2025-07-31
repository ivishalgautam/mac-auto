import SchemeForm from "@/components/forms/scheme-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateDialog({ isOpen, setIsOpen, type = "create", id }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Create scheme" : "Update scheme"}
          </DialogTitle>
          <DialogDescription className={"sr-only"}>scheme</DialogDescription>
          <div className="mt-2">
            <SchemeForm
              onSuccess={() => setIsOpen(false)}
              type={type}
              id={id}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
