import { z } from "zod";

// Supported image MIME types
const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/avif",
  "image/heic",
  "image/heif",
];

// Image file extensions
const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".tiff",
  ".tif",
  ".avif",
  ".heic",
  ".heif",
];

// Basic image schema
export const ImageSchema = z.object({
  name: z.string().min(1, "Image name is required"),
  size: z.number().min(0, "Image size must be non-negative"),
  type: z.enum(IMAGE_MIME_TYPES, {
    errorMap: () => ({ message: "Invalid image type" }),
  }),
  lastModified: z.number().optional(),
});

// Image with dimensions
export const ImageWithDimensionsSchema = ImageSchema.extend({
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  aspectRatio: z.number().optional(),
});

// Image upload schema with validation
export const ImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Image file cannot be empty")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Image must be less than 10MB",
    )
    .refine((file) => {
      const extension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));
      return IMAGE_EXTENSIONS.includes(extension);
    }, "Invalid image file extension")
    .refine(
      (file) => IMAGE_MIME_TYPES.includes(file.type),
      "Invalid image MIME type",
    ),
  alt: z.string().optional(),
  title: z.string().optional(),
  description: z.string().max(500, "Description too long").optional(),
});

// Profile image schema (stricter validation)
export const ProfileImageSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      "Profile image must be less than 2MB",
    )
    .refine((file) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      return allowedTypes.includes(file.type);
    }, "Profile image must be JPEG, PNG, or WebP"),
});

// Image with quality settings
export const ImageWithQualitySchema = ImageSchema.extend({
  quality: z.number().min(1).max(100).default(85),
  format: z.enum(["jpeg", "png", "webp", "avif"]).default("jpeg"),
  progressive: z.boolean().default(false),
});

// Image resize schema
export const ImageResizeSchema = z
  .object({
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    maintainAspectRatio: z.boolean().default(true),
    fit: z
      .enum(["cover", "contain", "fill", "inside", "outside"])
      .default("cover"),
    position: z
      .enum(["center", "top", "bottom", "left", "right"])
      .default("center"),
  })
  .refine(
    (data) => data.width || data.height,
    "Either width or height must be specified",
  );

// Image metadata schema
export const ImageMetadataSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  size: z.number(),
  mimeType: z.enum(IMAGE_MIME_TYPES),
  width: z.number().positive(),
  height: z.number().positive(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  uploadedAt: z.date(),
  uploadedBy: z.string(),
  alt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  exif: z.record(z.string(), z.any()).optional(),
});

// Image processing options
export const ImageProcessingSchema = z.object({
  resize: ImageResizeSchema.optional(),
  quality: z.number().min(1).max(100).default(85),
  format: z.enum(["jpeg", "png", "webp", "avif"]).optional(),
  blur: z.number().min(0).max(100).optional(),
  sharpen: z.number().min(0).max(100).optional(),
  brightness: z.number().min(-100).max(100).optional(),
  contrast: z.number().min(-100).max(100).optional(),
  saturation: z.number().min(-100).max(100).optional(),
  grayscale: z.boolean().default(false),
  rotate: z.number().min(0).max(360).optional(),
  flip: z.enum(["horizontal", "vertical", "both"]).optional(),
  crop: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
});

// Gallery image schema
export const GalleryImageSchema = z.object({
  id: z.string(),
  src: z.string().url(),
  thumbnail: z.string().url(),
  alt: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().optional(),
});

// Multiple images upload
export const MultipleImagesUploadSchema = z.object({
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed")
    .refine(
      (files) => files.every((file) => IMAGE_MIME_TYPES.includes(file.type)),
      "All files must be valid images",
    )
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "All images must be less than 5MB",
    ),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// Image with different size variants
export const ImageVariantsSchema = z.object({
  original: z.string().url(),
  large: z.string().url().optional(),
  medium: z.string().url().optional(),
  small: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  webp: z
    .object({
      original: z.string().url().optional(),
      large: z.string().url().optional(),
      medium: z.string().url().optional(),
      small: z.string().url().optional(),
    })
    .optional(),
});

// Social media image schema
export const SocialImageSchema = z
  .object({
    platform: z.enum([
      "facebook",
      "twitter",
      "instagram",
      "linkedin",
      "pinterest",
    ]),
    file: z
      .instanceof(File)
      .refine(
        (file) => IMAGE_MIME_TYPES.includes(file.type),
        "Invalid image type",
      ),
  })
  .refine(
    (data) => {
      const { platform, file } = data;

      // Platform-specific size limits
      const limits = {
        facebook: 8 * 1024 * 1024, // 8MB
        twitter: 5 * 1024 * 1024, // 5MB
        instagram: 30 * 1024 * 1024, // 30MB
        linkedin: 20 * 1024 * 1024, // 20MB
        pinterest: 32 * 1024 * 1024, // 32MB
      };

      return file.size <= limits[platform];
    },
    {
      message: "Image size exceeds platform limit",
      path: ["file"],
    },
  );

// Avatar image schema
export const AvatarImageSchema = z
  .object({
    file: z
      .instanceof(File)
      .refine(
        (file) => file.size <= 1024 * 1024,
        "Avatar must be less than 1MB",
      )
      .refine((file) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        return allowedTypes.includes(file.type);
      }, "Avatar must be JPEG, PNG, or WebP"),
  })
  .refine(async (data) => {
    // Check if image is square (async validation example)
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width === img.height);
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(data.file);
    });
  }, "Avatar image must be square");

// Image URL schema
export const ImageUrlSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  title: z.string().optional(),
  loading: z.enum(["lazy", "eager"]).default("lazy"),
  sizes: z.string().optional(),
  srcset: z.string().optional(),
});

// Utility functions
export const validateImageFile = (file) => {
  return ImageUploadSchema.parse({ file });
};

export const createImageMetadata = (file, dimensions) => {
  return ImageMetadataSchema.parse({
    id: crypto.randomUUID(),
    filename: `${Date.now()}_${file.name}`,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
    width: dimensions.width,
    height: dimensions.height,
    url: URL.createObjectURL(file),
    uploadedAt: new Date(),
    uploadedBy: "current-user",
    tags: [],
    isPublic: false,
  });
};

// Usage examples:

/*
// Basic image validation
const validateImage = (file: File) => {
  try {
    const result = ImageUploadSchema.parse({ file });
    console.log('Valid image:', result);
    return result;
  } catch (error) {
    console.error('Image validation error:', error);
    throw error;
  }
};

// Profile image validation
const validateProfileImage = (file: File) => {
  return ProfileImageSchema.parse({ file });
};

// Multiple images validation
const validateMultipleImages = (files: File[]) => {
  return MultipleImagesUploadSchema.parse({ images: files });
};
*/
