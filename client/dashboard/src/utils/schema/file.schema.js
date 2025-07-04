import { z } from "zod";

const fileSizeLimit = 5 * 1024 * 1024; // 5MB

export const fileUploadSchema = z
  .instanceof(FileList)
  .refine((list) => list.length > 0, "No files selected")
  .refine((list) => list.length <= 5, "Maximum 5 files allowed")
  .transform((list) => Array.from(list))
  .refine(
    (files) => {
      const allowedTypes = {
        "image/jpg": true,
        "image/jpeg": true,
        "image/png": true,
        "application/pdf": true,
        "application/msword": true,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
      };
      return files.every((file) => allowedTypes[file.type]);
    },
    { message: "Invalid file type. Allowed types: JPG, PNG, PDF, DOC, DOCX" }
  )
  .refine(
    (files) => {
      return files.every((file) => file.size <= fileSizeLimit);
    },
    {
      message: "File size should not exceed 5MB",
    }
  );
