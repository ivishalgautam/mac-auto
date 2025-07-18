import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { saveFile } from "../../utils/file.js";

// Helper to convert `items[0][heading]` into nested object
function assignNestedKey(obj, key, value) {
  if (!key || typeof key !== "string") return;

  const path = key
    .replace(/\]/g, "") // remove all ]
    .split(/\[|\./) // split by [ or .
    .filter(Boolean); // filter out empty strings

  if (!path.length) return;

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    const nextSegment = path[i + 1];
    const isArray = /^\d+$/.test(nextSegment);

    if (
      !Object.prototype.hasOwnProperty.call(current, segment) ||
      typeof current[segment] !== "object" ||
      current[segment] === null
    ) {
      current[segment] = isArray ? [] : {};
    }

    current = current[segment];
  }

  const last = path[path.length - 1];

  // Prevent overwriting arrays or objects with primitives
  if (
    Array.isArray(current[last]) ||
    (current[last] && typeof current[last] === "object")
  ) {
    return;
  }

  current[last] = value;
}

export const multipartPreHandler = async (
  req,
  reply,
  checkForArrayElements = []
) => {
  const parts = req.parts();
  const body = {};
  const filePaths = [];

  try {
    for await (const part of parts) {
      if (part.file) {
        const filePath = await saveFile(part);
        // assignNestedKey(body, part.fieldname, filePath);
        part.fieldname in body
          ? body[part.fieldname].push(filePath)
          : (body[part.fieldname] = [filePath]);
        filePaths.push(filePath);
      } else {
        let value = part.value;

        // Normalize value
        if (value === "null") value = null;
        else if (value === "undefined") value = undefined;
        else if (value === "true") value = true;
        else if (value === "false") value = false;

        // Try parsing if explicitly needed
        if (checkForArrayElements.includes(part.fieldname)) {
          try {
            value = JSON.parse(value);
          } catch (err) {}
        }

        assignNestedKey(body, part.fieldname, value);
      }
    }

    req.body = body;
    req.filePaths = filePaths;
    console.log({ body, filePaths });
  } catch (error) {
    console.error("Multipart error:", error);
    if (filePaths.length) {
      await cleanupFiles(filePaths);
    }
    throw new Error("File upload failed");
  }
};
