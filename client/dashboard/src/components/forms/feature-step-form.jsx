import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import FileUpload from "../file-uploader";

export default function FeaturesStepsForm() {
  const [previewData, setPreviewData] = useState(null);

  const defaultValues = {
    header: {
      title: "",
      subtitle: "",
      description: "",
    },
    steps: [],
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues,
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  const onSubmit = (data) => {
    setPreviewData(data);
    console.log("Form Data:", JSON.stringify(data, null, 2));
  };

  const addNewStep = () => {
    appendStep({
      number: (stepFields.length + 1).toString(),
      title: "",
      text: "",
      image: "",
      icon: "",
      features: [
        {
          list: [],
        },
      ],
    });
  };

  const loadSampleData = () => {
    const sampleData = {
      header: {
        title: "Key Features",
        subtitle: "Why Tejas DHL stands out",
        description:
          "Loaded with next-gen features, Tejas DHL offers comfort, safety, and performance for city commuting.",
      },
      steps: [
        {
          number: "1",
          title: "Comfort-First Design",
          text: "Designed to offer ample legroom, ergonomic seating, and vibration-free rides.",
          image: "/img/auto.jpg",
          icon: "/travel.png",
          features: [
            {
              list: [
                {
                  strong: "Spacious Cabin",
                  description: "Comfortably fits 5 including the driver.",
                },
                {
                  strong: "Noise Reduction",
                  description: "Minimal road noise and smooth drive.",
                },
              ],
            },
          ],
        },
        {
          number: "2",
          title: "Smart Dashboard & Safety",
          text: "Real-time data with essential indicators, along with upgraded braking system.",
          image: "/img/banner1.png",
          icon: "/travel.png",
          features: [
            {
              list: [
                {
                  strong: "Digital Speedometer",
                  description: "Clear visibility and essential indicators.",
                },
                {
                  strong: "Hydraulic Brakes",
                  description: "Responsive braking for safe urban driving.",
                },
              ],
            },
          ],
        },
      ],
    };

    reset(sampleData);
  };

  return (
    <div className="">
      <div className="">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Features Steps Form</h1>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={loadSampleData}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Load Sample Data
              </Button>
              <Button
                type="button"
                onClick={() => reset(defaultValues)}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Clear Form
              </Button>
            </div>
          </div>
        </div>

        <div className="">
          {/* Header Section */}
          <div className="rounded-lg p-6">
            <h2 className="mb-4 text-lg font-semibold">Header Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Title *</Label>
                <Input
                  type="text"
                  {...register("header.title", {
                    required: "Title is required",
                  })}
                  className={cn({ "border-red-500": errors.header?.title })}
                  placeholder="Enter title"
                />
              </div>

              <div>
                <Label>Subtitle *</Label>
                <Input
                  type="text"
                  {...register("header.subtitle", {
                    required: "Subtitle is required",
                  })}
                  className={cn({ "border-red-500": errors.header?.subtitle })}
                  placeholder="Enter subtitle"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Description *</Label>
              <Textarea
                {...register("header.description", {
                  required: "Description is required",
                })}
                rows={3}
                className={cn({ "border-red-500": errors.header?.description })}
                placeholder="Enter description"
              />
            </div>
          </div>

          {/* Steps Section */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Steps</h2>
              <Button size="sm" type="button" onClick={addNewStep}>
                <Plus className="h-4 w-4" />
                Add Step
              </Button>
            </div>

            <div className="space-y-6">
              {stepFields.map((field, stepIndex) => (
                <StepItem
                  key={field.id}
                  stepIndex={stepIndex}
                  control={control}
                  register={register}
                  errors={errors}
                  removeStep={removeStep}
                  showDeleteButton={stepFields.length > 1}
                />
              ))}
            </div>

            {stepFields.length === 0 && (
              <div className="border-input rounded-lg border-2 border-dashed py-8 text-center text-gray-500">
                <p>No steps added yet. Click "Add Step" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StepItem = ({
  stepIndex,
  control,
  register,
  errors,
  removeStep,
  showDeleteButton,
}) => {
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: `steps.${stepIndex}.features`,
  });

  const addFeature = () => {
    appendFeature([]);
  };

  return (
    <div className="border-input rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-md font-semibold">Step {stepIndex + 1}</h3>
        {showDeleteButton && (
          <Button
            size="icon"
            variant="destructive"
            type="button"
            onClick={() => removeStep(stepIndex)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Title *</Label>
          <Input
            type="text"
            {...register(`steps.${stepIndex}.title`, {
              required: "Title is required",
            })}
            className={cn({
              "border-red-500": errors.steps?.[stepIndex]?.title,
            })}
            placeholder="Enter step title"
          />
        </div>
      </div>

      <div className="mb-4">
        <Label>Text *</Label>
        <Textarea
          {...register(`steps.${stepIndex}.text`, {
            required: "Text is required",
          })}
          rows={2}
          className={cn({
            "border-red-500": errors.steps?.[stepIndex]?.text,
          })}
          placeholder="Enter step description"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Image Path</Label>
          <FileUpload
            onFileChange={(data) => {
              setFiles((prev) => ({ ...prev, carousel: data }));
            }}
            inputName={"carousel"}
            className={cn({ "border-red-500": errors.carousel })}
            initialFiles={[]}
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="border-input border-t pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Features</h4>
          <Button type="button" onClick={addFeature} size={"sm"}>
            <Plus className="h-3 w-3" />
            Add Feature Group
          </Button>
        </div>

        <div className="space-y-4">
          {featureFields.map((feature, featureIndex) => (
            <FeatureItem
              key={feature.id}
              stepIndex={stepIndex}
              featureIndex={featureIndex}
              control={control}
              register={register}
              errors={errors}
              removeFeature={removeFeature}
              showDeleteButton={featureFields.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({
  stepIndex,
  featureIndex,
  control,
  register,
  errors,
  removeFeature,
  showDeleteButton,
}) => {
  const {
    fields: listFields,
    append: appendListItem,
    remove: removeListItem,
  } = useFieldArray({
    control,
    name: `steps.${stepIndex}.features.${featureIndex}.list`,
  });

  const addListItem = () => {
    appendListItem({ strong: "", description: "" });
  };

  return (
    <div className="border-input rounded-md border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h5 className="text-sm font-medium">
          Feature Group {featureIndex + 1}
        </h5>
        {showDeleteButton && (
          <Button
            size="icon"
            variant="destructive"
            type="button"
            onClick={() => removeFeature(featureIndex)}
          >
            <Trash className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {listFields.map((listItem, listIndex) => (
          <div key={listItem.id} className="flex items-start gap-3">
            <Input
              type="text"
              {...register(
                `steps.${stepIndex}.features.${featureIndex}.list.${listIndex}.strong`,
              )}
              placeholder="Feature title (strong)"
            />
            <Input
              type="text"
              {...register(
                `steps.${stepIndex}.features.${featureIndex}.list.${listIndex}.description`,
              )}
              placeholder="Feature description"
            />
            <Button
              size="icon"
              variant="destructive"
              type="button"
              onClick={() => removeListItem(listIndex)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" onClick={addListItem} size="sm" className={"mt-3"}>
        <Plus className="h-3 w-3" />
        Add Feature
      </Button>
    </div>
  );
};
