import { deleteFile } from "../utils/file.js";

export const cleanupFiles = async (filePaths) => {
  if (!Array.isArray(filePaths) || !filePaths?.length) return;
  for (const filePath of filePaths) {
    try {
      await deleteFile(filePath);
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    }
  }
};
