import Image from "next/image";

export function BankIdentity({ bankName }: { bankName: string }) {
  const normalized = bankName.toLocaleLowerCase("it-IT");
  const intesa = /intesa|sanpaolo|\bisp\b/.test(normalized);
  const revolut = normalized.includes("revolut");
  if (!intesa && !revolut) return <span className="block max-w-[190px] truncate text-sm font-extrabold tracking-tight">{bankName}</span>;

  return (
    <div className="min-w-0">
      <div className={`inline-flex h-7 items-center ${intesa ? "rounded-md bg-white px-2" : ""}`}>
        <Image src={intesa ? "/bank-logos/intesa-sanpaolo.png" : "/bank-logos/revolut.svg"}
          alt={intesa ? "Intesa Sanpaolo" : "Revolut"} width={intesa ? 146 : 92} height={22}
          unoptimized className="max-h-[22px] w-auto max-w-[146px] object-contain" />
      </div>
      <p className="mt-1 max-w-[190px] truncate text-[9px] font-semibold opacity-80">{bankName}</p>
    </div>
  );
}
