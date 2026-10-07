import Image from "next/image";

export function BankIdentity({ bankName }: { bankName: string }) {
  const normalized = bankName.trim().toLocaleLowerCase("it-IT").replace(/[^\p{L}\p{N}]+/gu, " ");
  const intesa = /intesa|sanpaolo|\bisp\b/.test(normalized);
  const revolut = normalized.includes("revolut");
  const fineco = /\bfineco(?:bank)?\b/.test(normalized);
  const allianz = /\ballianz\b/.test(normalized);
  if (!intesa && !revolut && !fineco && !allianz) return <span className="block max-w-[190px] truncate text-sm font-extrabold tracking-tight">{bankName}</span>;
  const src = intesa ? "/bank-logos/intesa-sanpaolo.png" : fineco ? "/bank-logos/fineco-wordmark.svg" : allianz ? "/bank-logos/allianz-wordmark.svg" : "/bank-logos/revolut.svg";
  const label = intesa ? "Intesa Sanpaolo" : fineco ? "Fineco" : allianz ? "Allianz" : "Revolut";

  return (
    <div className="min-w-0 h-7 flex items-center">
      <div className={`inline-flex h-7 items-center ${intesa ? "rounded-md bg-white px-2" : ""}`}>
        <Image src={src}
          alt={label} width={allianz ? 92 : intesa ? 146 : 92} height={22}
          unoptimized className="max-h-[22px] w-auto max-w-[146px] object-contain" />
      </div>
    </div>
  );
}
