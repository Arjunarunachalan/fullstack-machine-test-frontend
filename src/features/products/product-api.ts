import type { ProductInput, ProductUpdateInput } from "@/shared";
import { api, type Product } from "@/lib/api";

export async function getProducts() {
  const response = await api.get<{ data: Product[] }>("/products");
  return response.data.data;
}

export async function getProduct(id: string) {
  const response = await api.get<{ data: Product }>(`/products/${id}`);
  return response.data.data;
}

export async function createProduct(input: ProductInput) {
  const response = await api.post<{ data: Product }>("/products", input);
  return response.data.data;
}

export async function updateProduct(id: string, input: ProductUpdateInput) {
  const response = await api.put<{ data: Product }>(`/products/${id}`, input);
  return response.data.data;
}

export async function deleteProduct(id: string) {
  const response = await api.delete<{ data: { id: string } }>(`/products/${id}`);
  return response.data.data;
}

export async function uploadMedia(file: File, type: "image" | "video") {
  const presign = await api.post<{
    data: { uploadUrl: string; publicUrl: string; key: string; type: "image" | "video" };
  }>("/uploads/presign", {
    fileName: file.name,
    contentType: file.type,
    type
  });

  await fetch(presign.data.data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });

  return {
    url: presign.data.data.publicUrl,
    key: presign.data.data.key,
    type
  };
}
