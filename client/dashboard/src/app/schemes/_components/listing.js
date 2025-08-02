"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CalendarDays,
  Download,
  Edit,
  FileText,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useDeleteFollowupMutation } from "@/mutations/followup-mutation";
import { DeleteDialog } from "./delete-dialog";
import {
  useDeleteSchemeMutation,
  useGetSchemes,
} from "@/mutations/scheme-mutation";
import { CreateDialog } from "./create-dialog";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { P } from "@/components/ui/typography";
import config from "@/config";
import ErrorMessage from "@/components/ui/error";

export default function Listing({}) {
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const searchParamStr = searchParams.toString();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [id, setId] = useState(null);
  const [type, setType] = useState("");

  const router = useRouter();

  function openModal(type) {
    if (!type) return toast.warning("Please provide which modal should open!");
    if (type === "delete") {
      setIsDeleteOpen(true);
    }

    if (type === "create") {
      setType("create");
      setIsCreateOpen(true);
    }

    if (type === "edit") {
      setType("edit");
      setIsCreateOpen(true);
    }
  }

  const { data, isLoading, isError, error } = useGetSchemes(searchParamStr);
  const deleteMutation = useDeleteSchemeMutation(id, () =>
    setIsDeleteOpen(false),
  );

  useEffect(() => {
    if (!searchParamStr) {
      const params = new URLSearchParams();
      params.set("page", 1);
      params.set("limit", 10);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamStr, router]);

  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input rounded-lg">
      {user?.role === "admin" && (
        <div className="mb-2 text-end">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              openModal("create");
            }}
          >
            <Plus /> Create
          </Button>
        </div>
      )}

      {!data?.schemes?.length ? (
        <P>No Schemes Found!</P>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
          {data?.schemes?.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              openModal={openModal}
              setId={setId}
              user={user}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        {...{
          isOpen: isDeleteOpen,
          setIsOpen: setIsDeleteOpen,
          mutation: deleteMutation,
        }}
      />

      <CreateDialog
        {...{
          isOpen: isCreateOpen,
          setIsOpen: setIsCreateOpen,
          type: type,
          id: id,
        }}
      />
    </div>
  );
}

function SchemeCard({ scheme, openModal, setId, user }) {
  return (
    <Card key={scheme.id} className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Scheme</CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant={scheme.is_active ? "default" : "secondary"}>
              {scheme.is_active ? "Active" : "Inactive"}
            </Badge>
            {user?.role === "admin" && (
              <>
                <Button
                  type="button"
                  size={"icon"}
                  variant={"outline"}
                  onClick={() => {
                    openModal("edit");
                    setId(scheme.id);
                  }}
                >
                  <Edit />
                </Button>
                <Button
                  type="button"
                  size={"icon"}
                  variant={"destructive"}
                  onClick={() => {
                    openModal("delete");
                    setId(scheme.id);
                  }}
                >
                  <Trash2 />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="text-muted-foreground mt-1 h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Message</p>
            <p className="text-muted-foreground text-sm">{scheme.message}</p>
          </div>
        </div>

        {scheme.file && scheme.file.length > 0 && (
          <div className="flex items-start gap-3">
            <ImageIcon className="text-muted-foreground mt-1 h-4 w-4" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Files</p>
              {scheme.file.map((file, index) => (
                <a
                  key={index}
                  href={`${config.file_base}/${file}`}
                  target="_blank"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <div className="flex items-center gap-2">
                    <span>File: {index + 1}</span>
                    <Download className="h-3 w-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="text-muted-foreground flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>Date: {format(new Date(scheme.date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>
              Created:{" "}
              {format(new Date(scheme.created_at), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
