import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99)
});

export const cartMutationSchema = cartItemSchema;

export const cartRemoveSchema = z.object({
  productId: z.string().min(1)
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CartMutationInput = z.infer<typeof cartMutationSchema>;
export type CartRemoveInput = z.infer<typeof cartRemoveSchema>;
