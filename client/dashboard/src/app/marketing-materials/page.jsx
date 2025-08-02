"use client";

import PageContainer from "@/components/layout/page-container";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorMessage from "@/components/ui/error";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import config from "@/config";
import VehicleCategorySelect from "@/features/vehicle-category-select";
import VehicleSelect from "@/features/vehicle-select";
import { useGetVehicle } from "@/mutations/vehicle-mutation";
import { Download, Eye, FileText } from "lucide-react";
import React from "react";
import { Controller, useForm } from "react-hook-form";

export default function MarketingMaterialsPage() {
  const { control, watch, setValue } = useForm();
  const category = watch("category") ?? null;
  const vehicleId = watch("vehicle_id");
  const { data, isLoading, isError, error } = useGetVehicle(vehicleId);
  console.log({ data });
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Heading
          title={"Marketing materials"}
          description={"Download marketing materials."}
        />
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <VehicleCategorySelect
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("vehicle_id", "");
                  }}
                  value={field.value}
                />
              )}
            />
          </div>
          <div className="space-y-1">
            <Label>Model</Label>
            <Controller
              name="vehicle_id"
              control={control}
              render={({ field }) => (
                <VehicleSelect
                  onChange={field.onChange}
                  value={field.value}
                  searchParams={`category=${category}`}
                />
              )}
            />
          </div>
        </div>

        {category && vehicleId && (
          <div>
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <ErrorMessage error={error} />
            ) : (
              <MarketingMaterialData
                brochure={data.brochure}
                marketingMaterialData={data.marketing_material}
              />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function MarketingMaterialData({ marketingMaterialData = [], brochure = [] }) {
  const getFileIcon = (type) => {
    switch (type) {
      case "brochure":
      case "document":
        return <FileText className="h-5 w-5" />;
      case "images":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "brochure":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "document":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "images":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Helper function to parse file path and extract information
  const parseFilePath = (filePath, type) => {
    // Convert Windows path to web path
    const webPath = filePath.replace(/\\/g, "/");

    // Extract filename from path
    const fileName = webPath.split("/").pop() || "";

    // Extract file extension
    const fileExtension = fileName.split(".").pop()?.toUpperCase() || "PDF";

    // Create a clean title by removing timestamp and cleaning up the name
    const cleanTitle = fileName
      .replace(/^\d+_/, "") // Remove timestamp prefix
      .replace(/\.[^/.]+$/, "") // Remove file extension
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word

    return {
      id: filePath,
      title: cleanTitle,
      description:
        type === "brochure"
          ? "Vehicle brochure with specifications and features"
          : "Marketing material document",
      type: type,
      format: fileExtension,
      downloadUrl: `${config.file_base}/${webPath}`,
      fileName: fileName,
      category: type === "brochure" ? "Brochures" : "Marketing Materials",
    };
  };

  // Process the actual data
  const processedMaterials = [
    ...marketingMaterialData.map((filePath) =>
      parseFilePath(filePath, "marketing_material"),
    ),
    ...brochure.map((filePath) => parseFilePath(filePath, "brochure")),
  ];

  if (processedMaterials.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">
          No marketing materials available
        </h3>
        <p className="text-muted-foreground">
          Select a vehicle category and model to view available marketing
          materials.
        </p>
      </div>
    );
  }

  // Group materials by category
  const groupedMaterials = processedMaterials.reduce((acc, material) => {
    const category = material.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {});

  const handleDownload = (downloadUrl, fileName) => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Materials</p>
                <p className="text-2xl font-bold">
                  {processedMaterials.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Brochures</p>
                <p className="text-2xl font-bold">{brochure.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Marketing Materials</p>
                <p className="text-2xl font-bold">
                  {marketingMaterialData.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials by Category */}
      {Object.entries(groupedMaterials).map(([categoryName, materials]) => (
        <div key={categoryName} className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{categoryName}</h3>
            <Badge variant="secondary">{materials.length}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card
                key={material.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(material.type)}
                      <Badge variant={"outline"}>{material.format}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(material.downloadUrl, "_blank")
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base">{material.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {material.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{material.format} Document</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() =>
                      handleDownload(material.downloadUrl, material.fileName)
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
