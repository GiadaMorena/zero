import Image from "next/image";
import { getBankBrand } from "@/lib/bankBrands";
export function BankIdentity({ bankName }: { bankName: string }) {
  const brand = getBankBrand(bankName);
  if (!brand) return <span className="block max-w-[190px] truncate text-sm font-extrabold tracking-tight">{bankName}</span>;
  const compact = "compact" in brand && brand.compact;
  if ("postalCrop" in brand) return <span className="relative block h-6 w-[112px] overflow-hidden" style={{ mixBlendMode: "multiply" }}><Image src={`/bank-logos/${brand.file}`} alt={brand.label} width={224} height={224} unoptimized style={{ position: "absolute", width: 224, height: 224, maxWidth: "none", left: -56, top: -92 }} /></span>;
  return <div className="min-w-0 h-7 flex items-center gap-2">
    <div className={`inline-flex h-7 items-center ${"plate" in brand && brand.plate ? "rounded-md bg-white px-2" : ""}`}>
      <Image src={`/bank-logos/${brand.file}`} alt={brand.label} width={compact ? 24 : 112} height={24} unoptimized
        style={{ filter: "white" in brand && brand.white ? "brightness(0) invert(1)" : undefined, mixBlendMode: brand.label === "N26" ? "multiply" : undefined }}
        className={`max-h-[24px] w-auto ${compact ? "max-w-[24px]" : "max-w-[112px]"} object-contain`} />
    </div>
    {compact && <span className="text-sm font-bold">{brand.label}</span>}
  </div>;
}
