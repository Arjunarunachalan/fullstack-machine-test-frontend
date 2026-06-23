"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { addCartItem } from "@/features/cart/cart-api";
import { getProduct } from "./product-api";

export function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const product = useQuery({ queryKey: ["products", id], queryFn: () => getProduct(id) });
  
  const cartMutation = useMutation({
    mutationFn: addCartItem,
    onSuccess: async () => {
      toast.success("Added to cart");
      setIsSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      setTimeout(() => {
        setIsSuccess(false);
        router.push("/cart");
      }, 1000);
    },
    onError: (error: any) => {
      if (error?.response?.status === 401) {
        toast.error("Please login to add items to cart");
        router.push("/login");
      } else {
        toast.error("Failed to add to cart");
      }
    }
  });

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
          <Button 
            disabled={cartMutation.isPending || isSuccess}
            onClick={() => cartMutation.mutate({ productId: product.data._id, quantity: 1 })}
            className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSuccess ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {cartMutation.isPending ? "Adding..." : isSuccess ? "Added!" : "Add to Cart"}
          </Button>
          <Button asChild variant="outline">
            <Link href={`/products/${product.data._id}/edit`}>Edit</Link>
          </Button>
        </div>
      </aside>
    </section>
  );
}
