import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUploaderServer from "@/features/file-uploader-server";
import { cn } from "@/lib/utils";
import { Plus, Trash } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

export default function Features() {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {fields.map((field, index) => (
          <FeatureItem
            key={field.id}
            remove={remove}
            index={index}
            errors={errors}
            register={register}
          />
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        onClick={() => append({ heading: "", image: null })}
        variant={"outline"}
        control={control}
      >
        <Plus className="h-4 w-4" /> Add feature Item
      </Button>
    </div>
  );
}

function FeatureItem({ register, index, remove, errors, control }) {
  return (
    <div className="border-input space-y-2 rounded-md border p-4">
      {/* Heading */}
      <div className="space-y-1">
        <Label>Heading</Label>
        <Input
          {...register(`features.${index}.heading`)}
          placeholder="Enter heading"
          className={cn({
            "border-red-500": errors?.features?.[index]?.heading,
          })}
        />
      </div>

      {/* Sub Heading */}
      <div className="space-y-1">
        <Label>Sub Heading</Label>
        <Input
          {...register(`features.${index}.sub_heading`)}
          placeholder="Enter sub heading"
          className={cn({
            "border-red-500": errors?.features?.[index]?.sub_heading,
          })}
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-1">
        <Label>Image</Label>
        <Controller
          control={control}
          name={`features.${index}.image`}
          render={({ field: { value, onChange } }) => (
            <FileUploaderServer
              value={value}
              onFileChange={onChange}
              className={cn({
                "border-red-500": errors?.features?.[index]?.image,
              })}
            />
          )}
        />
      </div>

      {/* Remove Button */}
      <div className="text-right">
        <Button
          variant="destructive"
          type="button"
          size="icon"
          onClick={() => remove(index)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
