import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import InventoryForm from "@/components/forms/inventory-form";
import InventoryItemForm from "@/components/forms/inventory-item-form";

export function UpdateDialog({ isOpen, setIsOpen, id }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="sr-only">Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Inventory?</DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
          <div>
            <InventoryItemForm id={id} callback={() => setIsOpen(false)} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
