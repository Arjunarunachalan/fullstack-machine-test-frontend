"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Grid2X2, List, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/api";
import { addCartItem } from "@/features/cart/cart-api";
import { deleteProduct, getProducts } from "./product-api";

const columnHelper = createColumnHelper<Product>();

export function ProductList() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const queryClient = useQueryClient();
  const products = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const cartMutation = useMutation({ mutationFn: addCartItem });
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  const table = useReactTable({
    data: products.data ?? [],
    columns: [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <Link className="font-medium text-primary" href={`/products/${info.row.original._id}`}>{info.getValue()}</Link>
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => `$${info.getValue().toFixed(2)}`
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString()
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => cartMutation.mutate({ productId: info.row.original._id, quantity: 1 })}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(info.row.original._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })
    ],
    getCoreRowModel: getCoreRowModel()
  });

  if (products.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading products...</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage catalog items and media.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")} title="Grid view">
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button variant={view === "table" ? "default" : "outline"} size="icon" onClick={() => setView("table")} title="Table view">
            <List className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/products/new">
              <Plus className="h-4 w-4" />
              New
            </Link>
          </Button>
        </div>
      </div>
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products.data ?? []).map((product, index) => (
            <motion.article
              key={product._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <Link href={`/products/${product._id}`}>
                <img src={product.images[0]?.url} alt={product.name} className="aspect-[4/3] w-full object-cover" />
              </Link>
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => cartMutation.mutate({ productId: product._id, quantity: 1 })}>
                    <ShoppingCart className="h-4 w-4" />
                    Add
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/products/${product._id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-medium">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
