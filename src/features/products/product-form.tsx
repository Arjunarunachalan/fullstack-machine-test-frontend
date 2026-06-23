"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type MediaInput, type ProductInput } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Save, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/api";
import { createProduct, updateProduct, uploadMedia } from "./product-api";

type Props = {
  product?: Product;
};

const productFormSchema = productSchema.pick({
  name: true,
  price: true,
  description: true
});

type ProductFormValues = Pick<ProductInput, "name" | "price" | "description">;

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Media state ──────────────────────────────────────────────────────
  // Existing media loaded from the product being edited
  const [existingImages, setExistingImages] = useState<MediaInput[]>(
    (product?.images as MediaInput[]) ?? []
  );
  const [existingVideos, setExistingVideos] = useState<MediaInput[]>(
    (product?.videos as MediaInput[]) ?? []
  );

  // Newly selected files to be uploaded on save
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);

  const [error, setError] = useState<string | null>(null);

  // ── Blob URL management ──────────────────────────────────────────────
  // Generate blob preview URLs and clean them up to prevent memory leaks
  const newImagePreviews = useMemo(
    () => newImageFiles.map((file) => URL.createObjectURL(file)),
    [newImageFiles]
  );

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  // ── Remove handlers ──────────────────────────────────────────────────
  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index: number) {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingVideo(index: number) {
    setExistingVideos((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewVideo(index: number) {
    setNewVideoFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Form ─────────────────────────────────────────────────────────────
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ?? 0,
      description: product?.description ?? ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // Upload only the NEW files
      const uploadedImages = newImageFiles.length
        ? await Promise.all(newImageFiles.map((file) => uploadMedia(file, "image")))
        : [];
      const uploadedVideos = newVideoFiles.length
        ? await Promise.all(newVideoFiles.map((file) => uploadMedia(file, "video")))
        : [];

      // Merge: existing (kept) + newly uploaded
      const images = [...existingImages, ...uploadedImages] as MediaInput[];
      const videos = [...existingVideos, ...uploadedVideos] as MediaInput[];

      const payload = { ...values, images, videos };

      return product ? updateProduct(product._id, payload) : createProduct(payload);
    },
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push(`/products/${saved._id}`);
    },
    onError: () => setError("Could not save product. Check media uploads and required fields.")
  });

  function submit(values: ProductFormValues) {
    setError(null);
    // Unified validation: existing + new must total >= 3
    const totalImages = existingImages.length + newImageFiles.length;
    if (totalImages < 3) {
      setError("At least 3 images are required.");
      return;
    }
    mutation.mutate(values);
  }

  // ── Derived counts ──────────────────────────────────────────────────
  const totalImages = existingImages.length + newImageFiles.length;
  const hasNoImages = totalImages === 0;

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" {...form.register("price")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register("description")} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button disabled={mutation.isPending}>
          <Save className="h-4 w-4" />
          Save Product
        </Button>
      </div>

      <aside className="space-y-5 rounded-lg border bg-card p-4">
        {/* ── Images ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="images">Images ({totalImages})</Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setNewImageFiles((prev) => [...prev, ...files]);
              event.target.value = "";
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {/* Existing images with remove button */}
            {existingImages.map((media, index) => (
              <div key={media.key} className="group relative">
                <img
                  src={media.url}
                  alt=""
                  className="aspect-square rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute right-1 top-1 hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:flex"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* New image previews with remove button */}
            {newImagePreviews.map((src, index) => (
              <div key={src} className="group relative">
                <img
                  src={src}
                  alt=""
                  className="aspect-square rounded-md border-2 border-dashed border-primary/40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute right-1 top-1 hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:flex"
                  aria-label="Remove new image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Placeholder when no images at all */}
            {hasNoImages && (
              <div className="col-span-3 flex h-24 items-center justify-center rounded-md border border-dashed">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* ── Videos ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="videos">Videos</Label>
          <Input
            id="videos"
            type="file"
            accept="video/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setNewVideoFiles((prev) => [...prev, ...files]);
              event.target.value = "";
            }}
          />
          <div className="space-y-2">
            {/* Existing videos with remove button */}
            {existingVideos.map((media, index) => (
              <div key={media.key} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <Video className="h-4 w-4" />
                <span className="flex-1 truncate">{media.url.split("/").pop()}</span>
                <button
                  type="button"
                  onClick={() => removeExistingVideo(index)}
                  className="rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove video"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* New video files with remove button */}
            {newVideoFiles.map((file, index) => (
              <div key={file.name + index} className="flex items-center gap-2 rounded-md border border-dashed border-primary/40 p-2 text-sm">
                <Video className="h-4 w-4" />
                <span className="flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeNewVideo(index)}
                  className="rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove new video"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </form>
  );
}
