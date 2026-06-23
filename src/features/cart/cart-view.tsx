"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCart, removeCartItem, updateCartItem } from "./cart-api";

export function CartView() {
  const queryClient = useQueryClient();
  const cart = useQuery({ queryKey: ["cart"], queryFn: getCart });
  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const items = cart.data?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  if (cart.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading cart...</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your cart is saved to your account.</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.productId._id} className="flex gap-4 rounded-lg border bg-card p-4">
                <img src={item.productId.images[0]?.url} alt={item.productId.name} className="h-24 w-24 rounded-md object-cover" />
                <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/products/${item.productId._id}`} className="font-semibold">
                      {item.productId.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">${item.productId.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        updateMutation.mutate({
                          productId: item.productId._id,
                          quantity: Math.max(1, item.quantity - 1)
                        })
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        updateMutation.mutate({
                          productId: item.productId._id,
                          quantity: item.quantity + 1
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => removeMutation.mutate(item.productId._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span>Items</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="mt-3 flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
