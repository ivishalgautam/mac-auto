import { saveFile } from "../utils/file.js";

export const multipartPreHandler = async (
  req,
  reply,
  checkForArrayElements = []
) => {
  const parts = req.parts();
  const body = {};
  const filePaths = [];

  for await (const part of parts) {
    if (part.file) {
      const filePath = await saveFile(part);
      part.fieldname in body
        ? body[part.fieldname].push(filePath)
        : (body[part.fieldname] = [filePath]);

      filePaths.push(filePath);
    } else {
      checkForArrayElements.some((item) => item === part.fieldname)
        ? (body[part.fieldname] = JSON.parse(part.value))
        : (body[part.fieldname] = part.value);
    }
  }
  req.body = body;
  req.filePaths = filePaths;
};
