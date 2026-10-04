import { Wifi } from "lucide-react";
import { BankIdentity } from "./BankIdentity";

export function CardChip() {
  return (
    <div aria-hidden="true" className="relative h-7 w-10 overflow-hidden rounded-md border border-[#806c37]/50 bg-linear-to-br from-[#f3df9b] via-[#c4a765] to-[#f0dca5] shadow-sm">
      <div className="absolute inset-x-0 top-1/2 border-t border-[#806c37]/60" />
      <div className="absolute inset-y-0 left-1/3 right-1/3 rounded-sm border-x border-[#806c37]/60" />
      <div className="absolute inset-x-0 top-1/4 bottom-1/4 rounded-sm border-y border-[#806c37]/60" />
    </div>
  );
}

export function BankCardDetails({ bankName, number, expiry, holder }: { bankName: string; number: string; expiry: string; holder?: string }) {
  return (
    <>
      <div className="relative flex items-start justify-between gap-3">
        <BankIdentity bankName={bankName} />
        <Wifi aria-hidden="true" className="h-5 w-5 shrink-0 rotate-90 opacity-75" />
      </div>
      <div className="relative my-auto"><CardChip /></div>
      <div className="relative">
        <div className="flex items-end justify-between gap-3 font-mono">
          <span className="text-sm font-semibold tracking-[0.16em]">{number}</span>
          <span className="text-[10px] opacity-80">{expiry === "00/00" ? "" : expiry}</span>
        </div>
        {holder && <p className="mt-2 truncate text-[9px] font-semibold uppercase tracking-[0.14em] opacity-80">{holder}</p>}
      </div>
    </>
  );
}
