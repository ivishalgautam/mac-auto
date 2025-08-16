"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ExternalLink,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import PhoneSelect from "../ui/phone-input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useRouter } from "next/navigation";
import VehicleSelect from "@/features/vehicle-select";
import { walkInEnquirySchema } from "@/utils/schema/vehicle-inquiry.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWalkInEnquiry,
  fetchWalkinEnquiry,
  updateWalkinEnquiry,
} from "@/services/enquiry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { purchaseTypes } from "@/data";
import { useCallback, useEffect, useState } from "react";
import FileUpload from "../file-uploader";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import config from "@/config";

export default function WalkInEnquiryForm({ onSuccess, type = "create", id }) {
  const [files, setFiles] = useState({
    pan: [],
    aadhaar: [],
    electricity_bill: [],
    rent_agreement: [],
  });
  const [fileUrls, setFileUrls] = useState({
    pan_urls: [],
    aadhaar_urls: [],
    electricity_bill_urls: [],
    rent_agreement_urls: [],
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
    setError,
    trigger,
    setValue,
  } = useForm({
    resolver: zodResolver(walkInEnquirySchema),
    defaultValues: {
      vehicle_id: "",
      name: "",
      phone: "",
      location: "",
      purchase_type: "",
      pan: [],
      aadhaar: [],
      electricity_bill: [],
      rent_agreement: [],
    },
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const purchaseType = watch("purchase_type");
  const createMutation = useMutation({
    mutationFn: createWalkInEnquiry,
    onSuccess: () => {
      toast.success("Enquiry created.");
      queryClient.invalidateQueries(["walkin-enquiries"]);
      router.push("/walkin-enquiries?page=1&limit=10");
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
  const updateMutation = useMutation({
    mutationFn: (data) => updateWalkinEnquiry(id, data),
    onSuccess: () => {
      toast.success("Enquiry updated.");
      queryClient.invalidateQueries(["walkin-enquiries"]);
      router.back();
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["walkin-enquiries", id],
    queryFn: () => fetchWalkinEnquiry(id),
    enabled: ["edit", "view"].includes(type) && !!id,
  });
  const onSubmit = async (data) => {
    const isValid = await trigger([
      "pan",
      "aadhaar",
      "electricity_bill",
      "rent_agreement",
    ]);

    if (!isValid) return;

    const payload = {
      vehicle_id: data.vehicle_id,
      name: data.name,
      phone: data.phone,
      location: data.location,
      purchase_type: data.purchase_type,
    };

    const formData = new FormData();
    Object.entries(files).forEach(([key, value]) => {
      value.forEach((file) => {
        formData.append(key, file);
      });
    });
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (type === "edit") {
      Object.entries(fileUrls).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;

  const handlePANChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, pan: data }));
    setValue("pan", data);
  }, []);
  const handleAadhaarChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, aadhaar: data }));
    setValue("aadhaar", data);
  }, []);
  const handleEBillChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, electricity_bill: data }));
    setValue("electricity_bill", data);
  }, []);
  const handleRentAgreementChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, rent_agreement: data }));
    setValue("rent_agreement", data);
  }, []);

  useEffect(() => {
    if (["edit", "view"].includes(type) && data) {
      setFileUrls((prev) => ({
        ...prev,
        pan_urls: data.pan,
        aadhaar_urls: data.aadhaar,
        electricity_bill_urls: data.electricity_bill,
        rent_agreement_urls: data.rent_agreement,
      }));

      reset({ ...data });
    }
  }, [data, type, reset]);

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  if (["edit", "view"].includes(type) && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Vehicle ID (Hidden field if passed as prop) */}
        <div className="space-y-2">
          <Label htmlFor="vehicle_id">Vehicle ID *</Label>
          <Controller
            name="vehicle_id"
            control={control}
            render={({ field }) => (
              <VehicleSelect
                value={field.value}
                onChange={field.onChange}
                className={cn({
                  "border-red-500 dark:border-red-500": errors.vehicle_id,
                })}
                disabled={type === "view"}
              />
            )}
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            {...register("name")}
            className={cn({ "border-red-500": errors.name })}
            disabled={type === "view"}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter your phone number"
                className={cn({
                  "border border-red-500": errors.phone,
                })}
                disabled={type === "view"}
              />
            )}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="Enter your location"
            {...register("location")}
            className={cn({ "border-red-500": errors.location })}
            disabled={type === "view"}
          />
        </div>

        {/* purchase type */}
        <div className="space-y-2">
          <Label htmlFor="purchase_type">Purchase type *</Label>
          <Controller
            name="purchase_type"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  key={field.value ?? ""}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={"w-full"}
                    disabled={type === "view"}
                  >
                    <SelectValue placeholder="Select purchase type" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseTypes.map((t) => {
                      return (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className={"capitalize"}
                        >
                          {t.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              );
            }}
          />
        </div>

        {purchaseType === "finance" && (
          <div className="col-span-full grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* PAN Card */}
            <div className="space-y-2">
              <Label>PAN Card</Label>
              {fileUrls.pan_urls.length ? (
                fileUrls.pan_urls.map((file, index) => (
                  <FileCard
                    key={index}
                    type={type}
                    file={file}
                    onRemove={() =>
                      type !== "view" &&
                      setFileUrls((prev) => ({
                        ...prev,
                        pan_urls: prev.pan_urls.filter((i) => i !== file),
                      }))
                    }
                    config={config}
                  />
                ))
              ) : (
                <FileUpload
                  onFileChange={handlePANChange}
                  inputName={"pan"}
                  className={cn({ "border-red-500": errors.pan })}
                  initialFiles={[]}
                  multiple={false}
                  maxFiles={1}
                  grid="grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
                />
              )}
            </div>

            {/* Aadhaar Card */}
            <div className="space-y-2">
              <Label>Aadhaar Card</Label>
              {fileUrls.aadhaar_urls?.length ? (
                fileUrls.aadhaar_urls.map((file, index) => (
                  <FileCard
                    key={index}
                    type={type}
                    file={file}
                    onRemove={() =>
                      type !== "view" &&
                      setFileUrls((prev) => ({
                        ...prev,
                        aadhaar_urls: prev.aadhaar_urls.filter(
                          (i) => i !== file,
                        ),
                      }))
                    }
                    config={config}
                  />
                ))
              ) : (
                <FileUpload
                  onFileChange={handleAadhaarChange}
                  inputName={"aadhaar"}
                  className={cn({ "border-red-500": errors.aadhaar })}
                  initialFiles={[]}
                  multiple={false}
                  maxFiles={1}
                  grid="grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
                />
              )}
            </div>

            {/* Electricity Bill */}
            <div className="space-y-2">
              <Label>Electricity Bill</Label>
              {fileUrls.electricity_bill_urls?.length ? (
                fileUrls.electricity_bill_urls.map((file, index) => (
                  <FileCard
                    key={index}
                    type={type}
                    file={file}
                    onRemove={() =>
                      type !== "view" &&
                      setFileUrls((prev) => ({
                        ...prev,
                        electricity_bill_urls:
                          prev.electricity_bill_urls.filter((i) => i !== file),
                      }))
                    }
                    config={config}
                  />
                ))
              ) : (
                <FileUpload
                  onFileChange={handleEBillChange}
                  inputName={"electricity_bill"}
                  className={cn({ "border-red-500": errors.electricity_bill })}
                  initialFiles={[]}
                  multiple={false}
                  maxFiles={1}
                  grid="grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
                />
              )}
            </div>

            {/* Rent Agreement */}
            <div className="space-y-2">
              <Label>Rent agreement</Label>
              {fileUrls.rent_agreement_urls?.length ? (
                fileUrls.rent_agreement_urls.map((file, index) => (
                  <FileCard
                    key={index}
                    type={type}
                    file={file}
                    onRemove={() =>
                      type !== "view" &&
                      setFileUrls((prev) => ({
                        ...prev,
                        rent_agreement_urls: prev.rent_agreement_urls.filter(
                          (i) => i !== file,
                        ),
                      }))
                    }
                    config={config}
                  />
                ))
              ) : (
                <FileUpload
                  onFileChange={handleRentAgreementChange}
                  inputName={"rent_agreement"}
                  className={cn({ "border-red-500": errors.rent_agreement })}
                  initialFiles={[]}
                  multiple={false}
                  maxFiles={1}
                  grid="grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Errors Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="mb-2 font-medium">
              Please fix the following errors:
            </div>
            <ul className="list-inside list-disc space-y-1">
              {formErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      {type !== "view" && (
        <div className="text-end">
          <Button
            type="submit"
            disabled={isFormPending}
            className="w-full sm:w-auto"
          >
            {isFormPending && (
              <LoaderCircleIcon
                className="-ms-1 animate-spin"
                size={16}
                aria-hidden="true"
              />
            )}
            Submit
          </Button>
        </div>
      )}
    </form>
  );
}

export const FileCard = ({ file, onRemove, type }) => {
  return (
    <div className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <a href={`${config.file_base}${file}`} target="_blank">
          <ExternalLink className="h-4 w-4" />
        </a>
        <span className="truncate">{file.split("\\").pop()}</span>
      </div>
      {type !== "view" && (
        <Button
          onClick={onRemove}
          size="icon"
          className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
          aria-label="Remove image"
          type="button"
        >
          <XIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
};
