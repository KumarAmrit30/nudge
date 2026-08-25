"use client";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ProductImage({ src, alt, className }: ProductImageProps) {
  return (
    // Ordinary <img>: no next/image, no image CDN, no extra package.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = "/product-placeholder.svg";
      }}
    />
  );
}
