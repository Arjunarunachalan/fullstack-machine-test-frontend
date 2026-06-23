"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Package, ShoppingCart } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Package },
  { href: "/products", label: "Products", icon: Package },
  { href: "/cart", label: "Cart", icon: ShoppingCart }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="min-h-screen">
      {!isAuthPage && (
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              ProductOps
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button key={item.href} asChild variant="ghost" size="sm">
                  <Link className={cn(pathname.startsWith(item.href) && "bg-muted")} href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
              {session && (
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </nav>
          </div>
        </header>
      )}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="mx-auto max-w-7xl px-4 py-8"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
