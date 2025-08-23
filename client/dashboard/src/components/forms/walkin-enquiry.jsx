"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { houseTypes, purchaseTypes } from "@/data";
import { useCallback, useEffect, useState } from "react";
import FileUpload from "../file-uploader";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import config from "@/config";
import { H1, H3 } from "../ui/typography";
import { walkInEnquirySchema } from "@/utils/schema/walking-enquiry.schema";

export default function WalkInEnquiryForm({ onSuccess, type = "create", id }) {
  const [files, setFiles] = useState({
    pan: [],
    aadhaar: [],
    electricity_bill: [],
    rent_agreement: [],
    guarantor_aadhaar: [],
  });

  const [fileUrls, setFileUrls] = useState({
    pan_urls: [],
    aadhaar_urls: [],
    electricity_bill_urls: [],
    rent_agreement_urls: [],
    guarantor_aadhaar_urls: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(walkInEnquirySchema),
    defaultValues: {
      vehicle_id: "",
      name: "",
      phone: "",
      location: "",
      purchase_type: "",
      house: undefined,

      pan: [],
      aadhaar: [],
      electricity_bill: [],
      rent_agreement: [],
      guarantor_aadhaar: [],

      landmark: undefined,
      alt_phone: undefined,
      references: undefined,
      permanent_address: undefined,
      present_address: undefined,
      guarantor: undefined,
      co_applicant: undefined,
    },
  });

  const queryClient = useQueryClient();
  const router = useRouter();
  const purchaseType = watch("purchase_type");
  const houseType = watch("house");

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

  const onSubmit = async (formDataValues) => {
    const isValid = await trigger([
      "pan",
      "aadhaar",
      "electricity_bill",
      "rent_agreement",
    ]);
    if (!isValid) return;

    const {
      pan,
      aadhaar,
      electricity_bill,
      rent_agreement,
      guarantor_aadhaar,
      ...rest
    } = formDataValues;
    const payload = { ...rest };

    const formData = new FormData();
    Object.entries(files).forEach(([key, value]) => {
      value.forEach((file) => formData.append(key, file));
    });
    Object.entries(payload).forEach(([key, value]) => {
      if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
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
  const handleGuarantorAadhaarChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, guarantor_aadhaar: data }));
    setValue("guarantor_aadhaar", data);
  }, []);

  useEffect(() => {
    const currentReferences = getValues("references");
    const currentGuarantor = getValues("guarantor");
    const currentCoApplicant = getValues("co_applicant");

    // ✅ Set references only if finance and not already populated
    if (purchaseType === "finance") {
      if (!currentReferences || currentReferences.length < 2) {
        setValue(
          "references",
          !currentReferences
            ? [
                { name: "", landmark: "" },
                { name: "", landmark: "" },
              ]
            : currentReferences?.map((r) => ({
                name: r.name ?? "",
                landmark: r.landmark ?? "",
              })),
        );
      }
    } else {
      setValue("references", undefined);
    }

    //  Set guarantor only if rented and not already populated
    if (purchaseType === "finance" && houseType === "rented") {
      if (!currentGuarantor || !currentGuarantor.name) {
        setValue("guarantor", {
          name: currentGuarantor.name,
          phone: currentGuarantor.phone,
          address: currentGuarantor.address,
        });
      }
    } else {
      setValue("guarantor", undefined);
    }

    //  Set co-applicant only if owned or parental and not already populated
    if (
      purchaseType === "finance" &&
      ["owned", "parental"].includes(houseType)
    ) {
      if (!currentCoApplicant || !currentCoApplicant.name) {
        setValue("co_applicant", {
          name: currentCoApplicant.name,
          phone: currentCoApplicant.phone,
          address: currentCoApplicant.address,
        });
      }
    } else {
      setValue("co_applicant", undefined);
    }
  }, [purchaseType, houseType, getValues, setValue]);

  useEffect(() => {
    if (["edit", "view"].includes(type) && data) {
      const safeData = {
        ...data,
        references: data.references?.length ? data.references : undefined,
        guarantor: data.guarantor?.name ? data.guarantor : undefined,
        co_applicant: data.co_applicant?.name ? data.co_applicant : undefined,
        alt_phone: data.alt_phone || undefined,
      };

      setFileUrls({
        pan_urls: data.pan,
        aadhaar_urls: data.aadhaar,
        electricity_bill_urls: data.electricity_bill,
        rent_agreement_urls: data.rent_agreement,
        guarantor_aadhaar_urls: data.guarantor_aadhaar,
      });
      reset(safeData);
    }
  }, [data, type, reset]);

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  if (["edit", "view"].includes(type) && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {type === "view" && <H1>{data.enquiry_code}</H1>}

      {/* Core Fields */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Vehicle *</Label>
          <Controller
            name="vehicle_id"
            control={control}
            render={({ field }) => (
              <VehicleSelect
                value={field.value}
                onChange={field.onChange}
                disabled={type === "view"}
                className={cn({
                  "border-red-500 dark:border-red-500": errors.vehicle_id,
                })}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input
            placeholder="Enter full name"
            {...register("name")}
            disabled={type === "view"}
            className={cn({ "border-red-500": errors.name })}
          />
        </div>

        <div className="space-y-2">
          <Label>Phone *</Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneSelect
                value={field.value}
                onChange={field.onChange}
                className={cn({
                  "border border-red-500": errors.phone,
                })}
                disabled={type === "view"}
                placeholder="Enter phone number"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Location *</Label>
          <Input
            placeholder="Enter location"
            {...register("location")}
            disabled={type === "view"}
            className={cn({ "border-red-500": errors.location })}
          />
        </div>

        <div className="space-y-2">
          <Label>Purchase Type *</Label>
          <Controller
            name="purchase_type"
            control={control}
            render={({ field }) => (
              <Select
                key={field.value}
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={type === "view"}
              >
                <SelectTrigger
                  className={cn("w-full", {
                    "border-red-500": errors.purchase_type,
                  })}
                >
                  <SelectValue placeholder="Select purchase type" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Always Fields */}
      {purchaseType === "finance" && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Landmark *</Label>
            <Input
              placeholder="Enter landmark"
              {...register("landmark")}
              disabled={type === "view"}
              className={cn({ "border-red-500": errors.landmark })}
            />
          </div>
          <div className="space-y-2">
            <Label>Alternate Phone *</Label>
            <Controller
              name="alt_phone"
              control={control}
              render={({ field }) => (
                <PhoneSelect
                  value={field.value}
                  onChange={field.onChange}
                  className={cn({
                    "border border-red-500": errors.alt_phone,
                  })}
                  disabled={type === "view"}
                  placeholder="Enter alternate phone number"
                />
              )}
            />
          </div>
          <div className="col-span-full space-y-2">
            <Label>References (2)</Label>
            {watch("references")?.map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <Input
                  id={`references.${i}.name`}
                  placeholder="Reference Name"
                  {...register(`references.${i}.name`)}
                  disabled={type === "view"}
                  className={cn({
                    "border-red-500": errors.references?.[i]?.name,
                  })}
                />
                <Input
                  id={`references.${i}.landmark`}
                  placeholder="Reference Landmark"
                  {...register(`references.${i}.landmark`)}
                  disabled={type === "view"}
                  className={cn({
                    "border-red-500": errors.references?.[i]?.landmark,
                  })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finance Fields */}
      {purchaseType === "finance" && (
        <div className="space-y-2">
          <H3>Finance</H3>
          <div>
            <div className="space-y-2">
              <Label>House *</Label>
              <Controller
                name="house"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val, { shouldValidate: true })
                    }
                    defaultValue={field.value}
                    disabled={type === "view"}
                  >
                    <SelectTrigger
                      className={cn("w-full capitalize", {
                        "border-red-500": errors.house,
                      })}
                    >
                      <SelectValue placeholder="Select house type" />
                    </SelectTrigger>
                    <SelectContent>
                      {houseTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {houseType === "rented" && (
              <div className="col-span-full grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Permanent Address</Label>
                  <Input
                    placeholder="Enter permanent address"
                    {...register("permanent_address")}
                    className={cn({
                      "border-red-500": errors.permanent_address,
                    })}
                    disabled={type === "view"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Present Address</Label>
                  <Input
                    placeholder="Enter present address"
                    {...register("present_address")}
                    className={cn({ "border-red-500": errors.present_address })}
                    disabled={type === "view"}
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <Label>Guarantor Details</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input
                      placeholder="Guarantor name"
                      {...register("guarantor.name")}
                      className={cn({
                        "border-red-500": errors.guarantor?.name,
                      })}
                      disabled={type === "view"}
                    />
                    <Controller
                      name="guarantor.phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneSelect
                          value={field.value}
                          onChange={field.onChange}
                          className={cn({
                            "border border-red-500": errors?.guarantor?.phone,
                          })}
                          disabled={type === "view"}
                          placeholder="Enter guarantor phone number"
                        />
                      )}
                    />
                    <Input
                      placeholder="Guarantor address"
                      {...register("guarantor.address")}
                      className={cn({
                        "border-red-500": errors.guarantor?.address,
                      })}
                      disabled={type === "view"}
                    />
                  </div>
                </div>
              </div>
            )}

            {["owned", "parental"].includes(houseType) && (
              <div className="col-span-full space-y-2">
                <Label>Co-applicant Details</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  <Input
                    placeholder="Co-applicant name"
                    {...register("co_applicant.name")}
                    disabled={type === "view"}
                    className={cn({
                      "border-red-500": errors?.co_applicant?.name,
                    })}
                  />
                  <Controller
                    name="co_applicant.phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneSelect
                        value={field.value}
                        onChange={field.onChange}
                        className={cn({
                          "border border-red-500": errors.co_applicant?.phone,
                        })}
                        disabled={type === "view"}
                        placeholder="Enter Co applicant number"
                      />
                    )}
                  />
                  <Input
                    placeholder="Co-applicant address"
                    {...register("co_applicant.address")}
                    disabled={type === "view"}
                    className={cn({
                      "border-red-500": errors?.co_applicant?.address,
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Uploads */}
      {purchaseType === "finance" && (
        <div className="space-y-2">
          <H3>Documents</H3>
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
                  multiple={true}
                  maxFiles={2}
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
            {houseType === "rented" && (
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
                    multiple={true}
                    maxFiles={5}
                    grid="grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
                  />
                )}
              </div>
            )}

            {/* Guarantor Aadhaar Card */}
            {houseType && (
              <div className="space-y-2">
                <Label>Guarantor Aadhaar Card</Label>
                {fileUrls.guarantor_aadhaar_urls?.length ? (
                  fileUrls.guarantor_aadhaar_urls.map((file, index) => (
                    <FileCard
                      key={index}
                      type={type}
                      file={file}
                      onRemove={() =>
                        type !== "view" &&
                        setFileUrls((prev) => ({
                          ...prev,
                          guarantor_aadhaar_urls:
                            prev.guarantor_aadhaar_urls.filter(
                              (i) => i !== file,
                            ),
                        }))
                      }
                      config={config}
                    />
                  ))
                ) : (
                  <FileUpload
                    onFileChange={handleGuarantorAadhaarChange}
                    inputName={"guarantor_aadhaar"}
                    className={cn({
                      "border-red-500": errors.guarantor_aadhaar,
                    })}
                    initialFiles={[]}
                    multiple={true}
                    maxFiles={2}
                    grid="grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="mb-2 font-medium">
              Please fix the following errors:
            </div>
            <ul className="list-inside list-disc space-y-1">
              {formErrors.map((err, i) => (
                <li key={i} className="text-sm">
                  {err}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {type !== "view" && (
        <div className="text-end">
          <Button type="submit" disabled={isFormPending}>
            {isFormPending && (
              <LoaderCircleIcon className="mr-2 animate-spin" size={16} />
            )}
            Submit
          </Button>
        </div>
      )}
    </form>
  );
}

export const FileCard = ({ file, onRemove, type }) => (
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
        className="absolute -top-2 -right-2 size-6 rounded-full border-2"
        type="button"
      >
        <XIcon className="size-3.5" />
      </Button>
    )}
  </div>
);
