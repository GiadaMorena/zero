import Image from "next/image";
import { getBankBrand } from "@/lib/bankBrands";
export function BankIdentity({ bankName }: { bankName: string }) {
  const brand = getBankBrand(bankName);
  if (!brand) return <span className="block max-w-[190px] truncate text-sm font-extrabold tracking-tight">{bankName}</span>;
  const compact = "compact" in brand && brand.compact;
  const wide = "wide" in brand && brand.wide;
  return <div className="min-w-0 h-7 flex items-center gap-2">
    <div className="inline-flex h-7 items-center">
      <Image src={`/bank-logos/${brand.file}`} alt={brand.label} width={compact ? 24 : wide ? 140 : 112} height={24} unoptimized
        style={{ filter: "white" in brand && brand.white ? "brightness(0) invert(1)" : undefined, mixBlendMode: brand.label === "N26" ? "multiply" : undefined }}
        className={`max-h-[24px] w-auto ${compact ? "max-w-[24px]" : wide ? "max-w-[140px]" : "max-w-[112px]"} object-contain`} />
    </div>
    {compact && <span className="text-sm font-bold">{brand.label}</span>}
  </div>;
}
