import { api, type Cart } from "@/lib/api";

export async function getCart() {
  const response = await api.get<{ data: Cart }>("/cart");
  return response.data.data;
}

export async function addCartItem(input: { productId: string; quantity: number }) {
  const response = await api.post<{ data: Cart }>("/cart/add", input);
  return response.data.data;
}

export async function removeCartItem(productId: string) {
  const response = await api.post<{ data: Cart }>("/cart/remove", { productId });
  return response.data.data;
}

export async function updateCartItem(input: { productId: string; quantity: number }) {
  const response = await api.post<{ data: Cart }>("/cart/update", input);
  return response.data.data;
}
