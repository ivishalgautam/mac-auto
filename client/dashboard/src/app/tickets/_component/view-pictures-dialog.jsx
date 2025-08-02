import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import config from "@/config";
import { EyeIcon } from "lucide-react";
import Image from "next/image";

export function ViewPicturesDialog({ isOpen, setIsOpen, pictures = [] }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pictures</AlertDialogTitle>
          <AlertDialogDescription className={"sr-only"}>
            pictures
          </AlertDialogDescription>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
            {pictures?.map((src, index) => (
              <div
                className="bg-accent group relative aspect-square w-24 rounded-md"
                key={index}
              >
                <Image
                  src={`${config.file_base}/${src}`}
                  width={200}
                  height={200}
                  className="size-full rounded-[inherit] object-cover"
                  alt={`carousel-${index}`}
                />

                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    target="_blank"
                    className={buttonVariants({
                      size: "icon",
                      variant: "ghost",
                    })}
                    href={`${config.file_base}/${src}`}
                  >
                    <EyeIcon className="size-5 text-white" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
