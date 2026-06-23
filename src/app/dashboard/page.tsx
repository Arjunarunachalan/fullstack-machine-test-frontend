import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Signed in as {session?.user.email}</p>
        <h1 className="mt-2 text-3xl font-semibold">Product management dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Create", "Add new products with images and videos.", "/products/new"],
          ["Browse", "Review products in grid or table view.", "/products"],
          ["Cart", "Manage your persistent product cart.", "/cart"]
        ].map(([title, copy, href]) => (
          <Link key={title} href={href} className="rounded-lg border bg-card p-5 shadow-sm transition hover:border-primary">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
          </Link>
        ))}
      </div>
      <Button asChild>
        <Link href="/products/new">Create Product</Link>
      </Button>
    </section>
  );
}
