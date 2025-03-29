import * as React from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface ImageProps extends Omit<NextImageProps, "alt"> {
  alt?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, alt = "", ...props }, ref) => {
    return (
      <NextImage
        ref={ref}
        className={cn("object-cover", className)}
        alt={alt}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export { Image }; 