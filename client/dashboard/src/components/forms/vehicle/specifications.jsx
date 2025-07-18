import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Trash } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function Specifications() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const {
    fields: tabFields,
    append: appendTab,
    remove: removeTab,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const specs = watch("specifications");

  const addSpec = (tabIndex) => {
    const current = specs[tabIndex]?.specs ?? [];
    const updated = [...current, { label: "", value: "" }];
    setValue(`specifications.${tabIndex}.specs`, updated);
  };

  const removeSpec = (tabIndex, specIndex) => {
    const current = specs[tabIndex]?.specs ?? [];
    const updated = current.filter((_, i) => i !== specIndex);
    setValue(`specifications.${tabIndex}.specs`, updated);
  };

  return (
    <div className="space-y-3">
      {tabFields.map((tab, tabIndex) => (
        <SpecificationItem
          key={tab.id}
          {...{
            tabIndex,
            errors,
            specs,
            register,
            removeSpec,
            addSpec,
            removeTab,
          }}
        />
      ))}

      <Button
        type="button"
        onClick={() => appendTab({ tab_name: "", specs: [] })}
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        Add Specification Tab
      </Button>
    </div>
  );
}

function SpecificationItem({
  tabIndex,
  errors,
  specs,
  register,
  removeSpec,
  addSpec,
  removeTab,
}) {
  return (
    <div className="border-input space-y-4 rounded-md border p-4">
      {/* Tab Name */}
      <div className="space-y-1">
        <Label>Tab Name</Label>
        <Input
          {...register(`specifications.${tabIndex}.tab_name`)}
          placeholder="e.g. Battery"
          className={cn({
            "border-red-500": errors?.specifications?.[tabIndex]?.tab_name,
          })}
        />
      </div>

      {/* Spec List */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
        {specs?.[tabIndex]?.specs?.map((_, specIndex) => (
          <div
            key={specIndex}
            className="border-input space-y-2 rounded-md border p-3"
          >
            <div className="space-y-1">
              <Label>Label</Label>
              <Input
                {...register(
                  `specifications.${tabIndex}.specs.${specIndex}.label`,
                )}
                placeholder="e.g. Range"
                className={cn({
                  "border-red-500":
                    errors?.specifications?.[tabIndex]?.specs?.[specIndex]
                      ?.label,
                })}
              />
            </div>

            <div className="space-y-1">
              <Label>Value</Label>
              <Input
                {...register(
                  `specifications.${tabIndex}.specs.${specIndex}.value`,
                )}
                placeholder="e.g. 85-100 km"
                className={cn({
                  "border-red-500":
                    errors?.specifications?.[tabIndex]?.specs?.[specIndex]
                      ?.value,
                })}
              />
            </div>

            <div className="text-right">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeSpec(tabIndex, specIndex)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addSpec(tabIndex)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Spec
        </Button>
      </div>

      {specs.length > 1 && (
        <div className="text-right">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeTab(tabIndex)}
          >
            <Trash className="size-4" />
            Remove Tab
          </Button>
        </div>
      )}
    </div>
  );
}
