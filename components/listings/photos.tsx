import Image from "next/image";
import { cn } from "@/lib/utils";

function isRemote(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function usesNextImage(src: string): boolean {
  return /zillowstatic\.com|d36xftgacqn2p\.cloudfront\.net/i.test(src);
}

function Photo({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  if (isRemote(src) && !usesNextImage(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />
    );
  }

  return (
    <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-cover", className)} />
  );
}

export function ListingPhotoStrip({
  photos,
  alt,
  size = "sm",
}: {
  photos?: string[];
  alt: string;
  size?: "sm" | "md";
}) {
  if (!photos?.length) return null;

  return (
    <ul className="flex gap-2 overflow-x-auto pb-0.5">
      {photos.map((src, index) => (
        <li
          key={`${src}-${index}`}
          className={cn(
            "relative shrink-0 overflow-hidden rounded-md border border-line bg-mist",
            size === "md" ? "h-20 w-28" : "h-14 w-[72px]",
          )}
        >
          <Photo src={src} alt={`${alt} photo ${index + 1}`} sizes={size === "md" ? "112px" : "72px"} />
        </li>
      ))}
    </ul>
  );
}

export function ListingThumb({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  if (!src) {
    return <span className="block h-10 w-12 rounded-md border border-line bg-mist" aria-hidden />;
  }

  return (
    <span className="relative block h-10 w-12 overflow-hidden rounded-md border border-line bg-mist">
      <Photo src={src} alt={alt} sizes="48px" />
    </span>
  );
}

export function ListingGallery({
  photos,
  alt,
  enhanced = false,
}: {
  photos?: string[];
  alt: string;
  enhanced?: boolean;
}) {
  if (!photos?.length) return null;

  const [hero, ...rest] = photos;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden rounded-md border border-line bg-mist",
          enhanced && "photo-enhance",
        )}
      >
        <Photo src={hero} alt={alt} sizes="(min-width: 768px) 720px, 100vw" />
      </div>
      {rest.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {rest.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-mist",
                enhanced && "photo-enhance",
              )}
            >
              <Photo src={src} alt={`${alt} photo ${index + 2}`} sizes="160px" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
