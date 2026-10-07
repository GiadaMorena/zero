import Image from "next/image";

export function BankIdentity({ bankName }: { bankName: string }) {
  const normalized = bankName.trim().toLocaleLowerCase("it-IT").replace(/[^\p{L}\p{N}]+/gu, " ");
  const intesa = /intesa|sanpaolo|\bisp\b/.test(normalized);
  const revolut = normalized.includes("revolut");
  const fineco = /\bfineco(?:bank)?\b/.test(normalized);
  const allianz = /\ballianz\b/.test(normalized);
  if (!intesa && !revolut && !fineco && !allianz) return <span className="block max-w-[190px] truncate text-sm font-extrabold tracking-tight">{bankName}</span>;
  const src = intesa ? "/bank-logos/intesa-sanpaolo.png" : fineco ? "/bank-logos/fineco.svg" : allianz ? "/bank-logos/allianz.svg" : "/bank-logos/revolut.svg";
  const label = intesa ? "Intesa Sanpaolo" : fineco ? "Fineco" : allianz ? "Allianz" : "Revolut";

  return (
    <div className="min-w-0">
      <div className={`inline-flex ${allianz ? "h-10" : "h-7"} items-center ${intesa || allianz ? "rounded-md bg-white px-2" : ""}`}>
        <Image src={src}
          alt={label} width={allianz ? 80 : intesa ? 146 : 92} height={allianz ? 36 : 22}
          unoptimized className={`${allianz ? "max-h-[36px]" : "max-h-[22px]"} w-auto max-w-[146px] object-contain`} />
      </div>
      <p className="mt-1 max-w-[190px] truncate text-[9px] font-semibold opacity-80">{bankName}</p>
    </div>
  );
}
