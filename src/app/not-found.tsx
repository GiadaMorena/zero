import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-dvh items-center justify-center bg-[#F7F7F5] px-6 text-[#0B0B0B]">
    <div className="max-w-md"><p className="mb-4 text-sm font-black tracking-widest">ZERO · 404</p><h1 className="text-4xl font-black tracking-tight">Questa pagina non c’è.</h1><p className="mt-4 text-base leading-relaxed text-[#666]">Il collegamento potrebbe essere cambiato. Torna all’app per continuare dalle tue finanze.</p><Link href="/" className="mt-8 inline-block rounded-full bg-[#FDC909] px-6 py-4 text-sm font-black">Torna a ZERO</Link></div>
  </main>;
}
