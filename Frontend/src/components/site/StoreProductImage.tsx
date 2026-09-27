import type { ImgHTMLAttributes } from "react";
import { productImageFallback, productImageSource } from "@/data/images";
import { useCatalog } from "@/store/catalog";

type StoreProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string;
  category?: string;
  productId?: string;
};

export function StoreProductImage({ src, category, productId, onError, ...props }: StoreProductImageProps) {
  const product = useCatalog((state) =>
    productId ? state.products.find((item) => item.id === productId) : undefined,
  );
  const resolvedCategory = category ?? product?.category ?? "";
  const fallback = productImageFallback(resolvedCategory);
  const currentProductImage = product?.images.find(
    (candidate) =>
      candidate &&
      candidate !== "/placeholder.svg" &&
      !candidate.includes("...") &&
      !candidate.startsWith("data:"),
  );
  const image = productImageSource(resolvedCategory, currentProductImage ?? src);

  return (
    <img
      {...props}
      src={image}
      onError={(event) => {
        onError?.(event);
        if (event.defaultPrevented) return;

        const fallbackUrl = new URL(fallback, event.currentTarget.ownerDocument.baseURI).href;
        if (event.currentTarget.src !== fallbackUrl) {
          event.currentTarget.src = fallbackUrl;
        }
      }}
    />
  );
}
