export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ProductMedia = {
  url: string;
  key: string;
  type: "image" | "video";
};
