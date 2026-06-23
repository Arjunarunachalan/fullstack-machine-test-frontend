"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { addCartItem } from "@/features/cart/cart-api";
import { getProduct } from "./product-api";

export function ProductDetail({ id }: { id: string }) {
  const product = useQuery({ queryKey: ["products", id], queryFn: () => getProduct(id) });
  const cartMutation = useMutation({ mutationFn: addCartItem });

  if (product.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading product...</p>;
  }

  if (!product.data) {
    return <p className="text-sm text-muted-foreground">Product not found.</p>;
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="grid gap-3 sm:grid-cols-2">
        {product.data.images.map((image) => (
          <img key={image.key} src={image.url} alt={product.data.name} className="aspect-square rounded-lg object-cover" />
        ))}
      </div>
      <aside className="space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">{product.data.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-primary">${product.data.price.toFixed(2)}</p>
        </div>
        <p className="text-muted-foreground">{product.data.description}</p>
        {product.data.videos.length > 0 && (
          <div className="space-y-3">
            {product.data.videos.map((video) => (
              <video key={video.key} src={video.url} controls className="w-full rounded-lg" />
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={() => cartMutation.mutate({ productId: product.data._id, quantity: 1 })}>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          <Button asChild variant="outline">
            <Link href={`/products/${product.data._id}/edit`}>Edit</Link>
          </Button>
        </div>
      </aside>
    </section>
  );
}
