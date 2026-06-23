"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/shared";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  mode: "login" | "register";
};

export function AuthCard({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isRegister = mode === "register";
  const form = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { email: "", password: "", ...(isRegister ? { name: "" } : {}) }
  });

  async function onSubmit(values: LoginInput | RegisterInput) {
    setError(null);

    if (isRegister) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        setError("Could not create account with those details.");
        return;
      }
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <motion.form
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{isRegister ? "Create account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? "Set up access to manage products." : "Sign in to continue managing products."}
          </p>
        </div>
        <div className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name" as never)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {isRegister ? "Register" : "Login"}
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="font-medium text-primary" href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
