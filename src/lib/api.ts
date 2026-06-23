import axios from "axios";
import { getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }

  return config;
});

export type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: Array<{ url: string; key: string; type: "image" }>;
  videos: Array<{ url: string; key: string; type: "video" }>;
  createdAt: string;
};

export type Cart = {
  _id: string;
  userId: string;
  items: Array<{
    productId: Product;
    quantity: number;
  }>;
};
