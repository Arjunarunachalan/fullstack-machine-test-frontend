import { ProductEdit } from "@/features/products/product-edit";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update details, images, and videos.</p>
      </div>
      <ProductEdit id={id} />
    </section>
  );
}
