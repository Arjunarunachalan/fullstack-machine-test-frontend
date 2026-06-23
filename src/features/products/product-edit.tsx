"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "./product-form";
import { getProduct } from "./product-api";

export function ProductEdit({ id }: { id: string }) {
  const product = useQuery({ queryKey: ["products", id], queryFn: () => getProduct(id) });

  if (product.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading product...</p>;
  }

  if (!product.data) {
    return <p className="text-sm text-muted-foreground">Product not found.</p>;
  }

  return <ProductForm product={product.data} />;
}
