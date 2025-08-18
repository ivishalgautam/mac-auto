import { Button } from "@/components/ui/button";
import config from "@/config";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";
import axios from "axios";
import {
  ImageIcon,
  ImagesIcon,
  ImageUpIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export default function FileUploaderServer({
  onFileChange,
  className = "",
  value,
}) {
  const { setValue } = useFormContext();
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB default

  // State to track upload progress for each file
  const [uploadProgress, setUploadProgress] = useState([]);
  const [filePaths, setFilePaths] = useState({});
  // Function to handle file upload to server
  const uploadFileToServer = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", file.file);

        const response = await axios.post(
          `${config.api_base}${endpoints.files.upload}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
            onUploadProgress: (event) => {
              if (event.lengthComputable) {
                const progressPercent = Math.round(
                  (event.loaded * 100) / event.total,
                );
                setUploadProgress((prev) =>
                  prev.map((item) =>
                    item.fileId === file.id
                      ? { ...item, progress: progressPercent }
                      : item,
                  ),
                );
              }
            },
          },
        );

        setUploadProgress((prev) =>
          prev.map((item) =>
            item.fileId === file.id ? { ...item, completed: true } : item,
          ),
        );
        resolve(response.data);
      } catch (error) {
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.fileId === file.id
              ? {
                  ...item,
                  error: error?.response?.data?.message || "Upload failed",
                }
              : item,
          ),
        );
        reject(error);
      }
    });
  };

  // Handle newly added files
  const handleFilesAdded = (addedFiles) => {
    // Initialize progress tracking for each new file
    const newProgressItems = addedFiles.map((file) => ({
      fileId: file.id,
      progress: 0,
      completed: false,
    }));

    // Add new progress items to state
    setUploadProgress((prev) => [...prev, ...newProgressItems]);

    // Start upload for each file
    addedFiles.forEach((file) => {
      if (file.file instanceof File) {
        uploadFileToServer(file)
          .then((response) => {
            const url = response.path[0];
            setFilePaths((prev) => ({ ...prev, [file.id]: url }));
            onFileChange(url);
          })
          .catch((error) => {
            console.error("Upload failed:", error);
          });
      }
    });
  };

  // Remove the progress tracking for the file
  const handleFileRemoved = async (filePath) => {
    return new Promise(async (resolve, reject) => {
      if (!filePath) return resolve("Image deleted");
      try {
        await http().delete(
          `${endpoints.files.getFiles}?file_path=${filePath}`,
        );
        // setUploadProgress((prev) =>
        //   prev.filter((item) => item.fileId !== fileId),
        // );
        resolve("Image deleted");
      } catch (error) {
        reject(error);
      }
    });
  };

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
    onFilesAdded: handleFilesAdded,
  });

  const previewUrl =
    files[0]?.preview || value ? `${config.file_base}/${value}` : null || null;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          role="button"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className={cn(
            "border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]",
            className,
          )}
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload file"
          />
          {previewUrl ? (
            <div className="absolute inset-0">
              <img
                src={previewUrl}
                alt={files[0]?.file?.name || "Uploaded image"}
                className="size-full object-cover"
                onError={() => onFileChange(null)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                Drop your image here or click to browse
              </p>
              <p className="text-muted-foreground text-xs">
                Max size: {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={() => {
                removeFile(files[0]?.id);
                handleFileRemoved(value)
                  .then((data) => onFileChange(null))
                  .catch((error) => console.log(error));
              }}
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
