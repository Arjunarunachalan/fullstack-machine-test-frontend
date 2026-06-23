import { z } from "zod";

export const mediaSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  type: z.enum(["image", "video"])
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(mediaSchema).min(3, "At least 3 images are required"),
  videos: z.array(mediaSchema).optional().default([])
});

export const productUpdateSchema = productSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update"
);

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
