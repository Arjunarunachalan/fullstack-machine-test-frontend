import { ProductForm } from "@/features/products/product-form";

export default function NewProductPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Create product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add details and upload at least 3 product images.</p>
      </div>
      <ProductForm />
    </section>
  );
}
