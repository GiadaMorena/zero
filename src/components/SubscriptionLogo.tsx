import Image from "next/image";
import type { ReactNode } from "react";

const brands = [
  { slug: "netflix", aliases: ["netflix"], label: "Netflix" },
  { slug: "spotify", aliases: ["spotify"], label: "Spotify" },
  { slug: "icloud", aliases: ["icloud"], label: "iCloud" },
  { slug: "disneyplus", aliases: ["disney+", "disney plus", "disneyplus"], label: "Disney+" },
  { slug: "openai", aliases: ["chatgpt", "openai"], label: "ChatGPT" },
  { slug: "amazonprime", aliases: ["amazon prime", "prime video"], label: "Amazon Prime" },
  { slug: "youtube", aliases: ["youtube"], label: "YouTube" },
  { slug: "applemusic", aliases: ["apple music"], label: "Apple Music" },
  { slug: "appletv", aliases: ["apple tv", "appletv"], label: "Apple TV" },
  { slug: "dropbox", aliases: ["dropbox"], label: "Dropbox" },
  { slug: "adobe", aliases: ["adobe", "creative cloud"], label: "Adobe" },
];

export function SubscriptionLogo({ name, size = 24, fallback }: { name: string; size?: number; fallback?: ReactNode }) {
  const normalized = name.trim().toLocaleLowerCase("it-IT");
  const brand = brands.find((item) => item.aliases.some((alias) => normalized.includes(alias)));
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[inherit] bg-white" style={{ width: size, height: size }}>
      {brand ? <Image src={`/subscription-logos/${brand.slug}.svg`} alt={brand.label} width={size} height={size} unoptimized className="h-full w-full object-contain p-0.5" /> : (fallback ?? <span className="text-[10px] font-extrabold text-[#111]">{name.charAt(0).toUpperCase()}</span>)}
    </span>
  );
}
