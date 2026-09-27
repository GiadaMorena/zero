"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  ShieldCheck,
  Umbrella,
  Landmark,
  TrendingUp,
  Car,
  Home,
  Heart,
  Briefcase,
  PiggyBank,
  Sparkles,
  Trash2,
  X,
  Info,
  ChevronRight,
  Plane,
  Coins,
  BarChart3,
} from "lucide-react";
import { useApp, ProtectionItem } from "@/context/AppContext";

export function ProtectionToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-block h-6 w-10 shrink-0 cursor-pointer rounded-full border-0 p-0 m-0 outline-none transition-colors duration-200 ease-in-out select-none ${
        checked ? "bg-[#FDC909]" : "bg-[#A7A7A7]/40"
      }`}
    >
      <span
        style={{
          top: "50%",
          left: checked ? "19px" : "3px",
          transform: "translateY(-50%)",
        }}
        className="pointer-events-none absolute h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-all duration-200 ease-in-out"
      />
    </button>
  );
}

const PRESET_PROTECTIONS = [
  {
    title: "PAC ETF All-World",
    provider: "Trade Republic",
    type: "pac" as const,
    category: "etf",
    amount: 150,
    amountType: "premio_mensile" as const,
    renewalDate: "1° del mese",
  },
  {
    title: "PAC Portafoglio Gestito",
    provider: "Moneyfarm",
    type: "pac" as const,
    category: "roboadvisor",
    amount: 200,
    amountType: "premio_mensile" as const,
    renewalDate: "Mensile",
  },
  {
    title: "RCA Auto & Assistenza",
    provider: "UnipolSai",
    type: "assicurazione" as const,
    category: "auto",
    amount: 380,
    amountType: "premio_annuale" as const,
    renewalDate: "15 Maggio",
  },
  {
    title: "Assicurazione Casa & Famiglia",
    provider: "Generali",
    type: "assicurazione" as const,
    category: "casa",
    amount: 190,
    amountType: "premio_annuale" as const,
    renewalDate: "10 Settembre",
  },
  {
    title: "Polizza Sanitaria Integrativa",
    provider: "Intesa Sanpaolo RBM",
    type: "assicurazione" as const,
    category: "salute",
    amount: 35,
    amountType: "premio_mensile" as const,
    renewalDate: "Mensile",
  },
  {
    title: "Fondo Pensione Negoziale",
    provider: "Fondo Cometa",
    type: "pensione" as const,
    category: "pensione_integrativa",
    amount: 14500,
    amountType: "valore_maturato" as const,
    renewalDate: "Orizzonte 2050",
  },
];

interface AssicurazioniScreenProps {
  onBack?: () => void;
}

export function AssicurazioniScreen({ onBack }: AssicurazioniScreenProps) {
  const { protections, addProtection, deleteProtection, toggleProtection } = useApp();

  const [filter, setFilter] = useState<"Tutti" | "Assicurazioni" | "Pensione" | "PAC">("Tutti");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [protType, setProtType] = useState<"assicurazione" | "pensione" | "pac">("pac");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("etf");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<ProtectionItem["amountType"]>("premio_mensile");
  const [policyNumber, setPolicyNumber] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [note, setNote] = useState("");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const filteredProtections = protections.filter((p) => {
    if (filter === "Assicurazioni") return p.type === "assicurazione";
    if (filter === "Pensione") return p.type === "pensione";
    if (filter === "PAC") return p.type === "pac";
    return true;
  });

  const activeInsurances = protections.filter((p) => p.type === "assicurazione" && p.active);
  const activePensions = protections.filter((p) => p.type === "pensione" && p.active);
  const activePACs = protections.filter((p) => p.type === "pac" && p.active);

  const handleApplyPreset = (preset: typeof PRESET_PROTECTIONS[0]) => {
    setTitle(preset.title);
    setProvider(preset.provider);
    setProtType(preset.type);
    setCategory(preset.category);
    setAmount(String(preset.amount));
    setAmountType(preset.amountType);
    setRenewalDate(preset.renewalDate);
    setIsAddModalOpen(true);
  };

  const handleSaveProtection = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    if (title.trim()) {
      addProtection({
        title: title.trim(),
        provider:
          provider.trim() ||
          (protType === "assicurazione"
            ? "Compagnia Assicurativa"
            : protType === "pensione"
            ? "Fondo Previdenziale"
            : "Piattaforma / Broker"),
        type: protType,
        category,
        amount: numAmount,
        amountType,
        policyNumber: policyNumber.trim() || undefined,
        renewalDate: renewalDate.trim() || undefined,
        note: note.trim() || undefined,
      });

      // Reset
      setTitle("");
      setProvider("");
      setAmount("");
      setPolicyNumber("");
      setRenewalDate("");
      setNote("");
      setIsAddModalOpen(false);
    }
  };

  const getCategoryIcon = (cat: string, type: "assicurazione" | "pensione" | "pac") => {
    if (type === "pac") return TrendingUp;
    if (type === "pensione") return Landmark;
    const lower = (cat || "").toLowerCase();
    if (lower.includes("auto") || lower.includes("veicol")) return Car;
    if (lower.includes("casa") || lower.includes("immob")) return Home;
    if (lower.includes("salute") || lower.includes("sanit")) return Heart;
    if (lower.includes("viagg") || lower.includes("volo")) return Plane;
    if (lower.includes("vita")) return Umbrella;
    return ShieldCheck;
  };

  const formatAmountLabel = (type: ProtectionItem["amountType"], val: number, protType?: "assicurazione" | "pensione" | "pac") => {
    if (val <= 0) return "Importo non specificato";
    switch (type) {
      case "premio_annuale":
        return `${money(val)} / anno`;
      case "premio_mensile":
        return protType === "pac" ? `Versamento: ${money(val)} / mese` : `${money(val)} / mese`;
      case "valore_maturato":
        return `Capitale accumulato: ${money(val)}`;
      case "versamento_periodico":
        return `Versamento: ${money(val)}`;
      default:
        return money(val);
    }
  };

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* ── 1. HEADER ── */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#0B0B0B] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">
              Assicurazioni, Pensione & PAC
            </h1>
            <p className="text-xs text-[#A7A7A7] font-medium mt-0.5">
              Coperture, previdenza e piani di accumulo
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setTitle("");
            setProvider("");
            setAmount("");
            setRenewalDate("");
            setProtType("pac");
            setAmountType("premio_mensile");
            setIsAddModalOpen(true);
          }}
          className="h-9 w-9 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* ── 2. INFORMATIVE NOTICE (Does NOT affect liquid totals) ── */}
      <div className="rounded-[22px] bg-white border border-[#A7A7A7]/20 p-3.5 flex items-start gap-3 shadow-xs">
        <div className="h-8 w-8 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shrink-0 shadow-xs">
          <Info className="h-4 w-4 stroke-[2.5]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#0B0B0B] leading-tight">
            Valore separato dal totale liquido
          </p>
          <p className="text-[11px] text-[#A7A7A7] font-medium mt-0.5 leading-snug">
            Le polizze, la previdenza integrativa e i piani di accumulo (PAC) sono registrati a solo scopo di monitoraggio e custodia patrimoniale. Non intaccano il saldo spendibile né il totale delle spese ordinarie.
          </p>
        </div>
      </div>

      {/* ── 3. STATS SUMMARY CARDS (3 Columns) ── */}
      <div className="grid grid-cols-3 gap-2">
        {/* PAC Card */}
        <div className="p-3 rounded-[20px] bg-white border border-[#A7A7A7]/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-6 w-6 rounded-lg bg-[#0B0B0B] text-[#FDC909] flex items-center justify-center font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <span className="text-[9px] font-bold text-[#A7A7A7] uppercase tracking-wider">
              PAC
            </span>
          </div>
          <div>
            <p className="text-base font-black text-[#0B0B0B] tracking-tight leading-tight">
              {activePACs.length} attivi
            </p>
            <p className="text-[9px] text-[#A7A7A7] font-medium mt-0.5 truncate">
              Investimenti
            </p>
          </div>
        </div>

        {/* Assicurazioni Card */}
        <div className="p-3 rounded-[20px] bg-white border border-[#A7A7A7]/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-6 w-6 rounded-lg bg-[#F7F7F5] border border-[#A7A7A7]/20 flex items-center justify-center text-[#0B0B0B]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <span className="text-[9px] font-bold text-[#A7A7A7] uppercase tracking-wider">
              Polizze
            </span>
          </div>
          <div>
            <p className="text-base font-black text-[#0B0B0B] tracking-tight leading-tight">
              {activeInsurances.length} attive
            </p>
            <p className="text-[9px] text-[#A7A7A7] font-medium mt-0.5 truncate">
              Coperture
            </p>
          </div>
        </div>

        {/* Previdenza Card */}
        <div className="p-3 rounded-[20px] bg-white border border-[#A7A7A7]/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-6 w-6 rounded-lg bg-[#F7F7F5] border border-[#A7A7A7]/20 flex items-center justify-center text-[#0B0B0B]">
              <Landmark className="h-3.5 w-3.5" />
            </div>
            <span className="text-[9px] font-bold text-[#A7A7A7] uppercase tracking-wider">
              Pensione
            </span>
          </div>
          <div>
            <p className="text-base font-black text-[#0B0B0B] tracking-tight leading-tight">
              {activePensions.length} fondi
            </p>
            <p className="text-[9px] text-[#A7A7A7] font-medium mt-0.5 truncate">
              Previdenza
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. PRESET QUICK SELECTION ── */}
      <div>
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[11px] font-bold text-[#A7A7A7] uppercase tracking-wider">
            Aggiunta rapida
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRESET_PROTECTIONS.map((preset) => {
            const Icon = getCategoryIcon(preset.category, preset.type);
            return (
              <button
                key={preset.title}
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-[#A7A7A7]/20 shadow-2xs shrink-0 hover:border-[#0B0B0B] active:scale-95 transition-all text-left cursor-pointer group"
              >
                <div className="h-6 w-6 rounded-lg bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center group-hover:bg-[#FDC909] transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B0B0B] leading-tight">{preset.title}</p>
                  <p className="text-[10px] text-[#A7A7A7] font-medium">{preset.provider}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. FILTER TABS (4 Segments) ── */}
      <div className="grid grid-cols-4 gap-1.5 bg-white border border-[#A7A7A7]/20 p-1.5 rounded-2xl">
        {(["Tutti", "Assicurazioni", "Pensione", "PAC"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer truncate text-center ${
              filter === f
                ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs"
                : "text-[#A7A7A7] hover:text-[#0B0B0B]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── 6. LIST OF ITEMS ── */}
      <div className="flex flex-col gap-2.5">
        {filteredProtections.map((item) => {
          const Icon = getCategoryIcon(item.category, item.type);
          return (
            <div
              key={item.id}
              onClick={() => toggleProtection(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-[22px] bg-white border cursor-pointer transition-all ${
                item.active
                  ? "border-[#A7A7A7]/30 shadow-xs opacity-100"
                  : "border-[#A7A7A7]/20 opacity-50 bg-[#F7F7F5]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F7F7F5] border border-[#A7A7A7]/20 flex items-center justify-center font-bold text-sm shrink-0 text-[#0B0B0B]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#0B0B0B] leading-tight">
                      {item.title}
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#F7F7F5] border border-[#A7A7A7]/20 text-[#0B0B0B]">
                      {item.provider}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7A7A7] font-medium mt-0.5">
                    {formatAmountLabel(item.amountType, item.amount, item.type)}
                    {item.renewalDate && ` · ${item.renewalDate}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Vuoi rimuovere ${item.title}?`)) {
                      deleteProtection(item.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#A7A7A7] hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Elimina"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <ProtectionToggle
                  checked={item.active}
                  onChange={() => toggleProtection(item.id)}
                />
              </div>
            </div>
          );
        })}

        {filteredProtections.length === 0 && (
          <div className="text-center py-10 text-[#A7A7A7] text-xs font-medium bg-white rounded-[24px] border border-[#A7A7A7]/20 p-6 flex flex-col items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#A7A7A7]/60" />
            <p className="font-bold text-[#0B0B0B]">Nessun elemento presente</p>
            <p className="text-[11px] max-w-xs">
              Usa i pulsanti in alto per aggiungere una polizza, un fondo pensione o un Piano di Accumulo (PAC ETF, Moneyfarm, Trade Republic...).
            </p>
          </div>
        )}
      </div>

      {/* ── 7. ADD MODAL (Raised & Spacious) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0B0B]/60 backdrop-blur-xs p-0 sm:p-4 select-none">
          <div
            className="w-full max-w-md bg-[#F7F7F5] rounded-t-[32px] sm:rounded-[32px] border border-[#A7A7A7]/30 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 min-h-[68dvh] max-h-[92dvh] overflow-y-auto no-scrollbar flex flex-col justify-between"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 2.5rem)" }}
          >
            <div>
              {/* Header with Dual Actions */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#A7A7A7]/15">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full bg-white border border-[#A7A7A7]/30 text-[#0B0B0B] hover:bg-[#F7F7F5]"
                >
                  <X className="h-4 w-4" />
                </button>
                <h2 className="text-sm font-black text-[#0B0B0B]">
                  Nuova posizione
                </h2>
                <button
                  type="submit"
                  form="add-prot-form"
                  className="px-3.5 py-1.5 rounded-full bg-[#0B0B0B] text-white text-xs font-black hover:bg-black active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  Aggiungi
                </button>
              </div>

              {/* Type Switch (PAC vs Assicurazione vs Pensione) */}
              <div className="grid grid-cols-3 gap-1.5 bg-white border border-[#A7A7A7]/20 p-1.5 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setProtType("pac");
                    setAmountType("premio_mensile");
                    setCategory("etf");
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    protType === "pac"
                      ? "bg-[#0B0B0B] text-white shadow-xs"
                      : "text-[#A7A7A7] hover:text-[#0B0B0B]"
                  }`}
                >
                  📈 PAC
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProtType("assicurazione");
                    setAmountType("premio_annuale");
                    setCategory("auto");
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    protType === "assicurazione"
                      ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs font-black"
                      : "text-[#A7A7A7] hover:text-[#0B0B0B]"
                  }`}
                >
                  🛡️ Polizza
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProtType("pensione");
                    setAmountType("valore_maturato");
                    setCategory("pensione_integrativa");
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    protType === "pensione"
                      ? "bg-[#0B0B0B] text-white shadow-xs"
                      : "text-[#A7A7A7] hover:text-[#0B0B0B]"
                  }`}
                >
                  🏛️ Pensione
                </button>
              </div>

              <form id="add-prot-form" onSubmit={handleSaveProtection} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                    {protType === "pac" ? "Nome Piano / Strumento *" : protType === "assicurazione" ? "Titolo Polizza *" : "Denominazione Fondo *"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      protType === "pac"
                        ? "Es. PAC ETF MSCI World, PAC Moneyfarm..."
                        : protType === "assicurazione"
                        ? "Es. RCA Auto Golf, Polizza Casa..."
                        : "Es. Fondo Cometa, Previdenza PAC..."
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                    {protType === "pac" ? "Piattaforma / Broker" : protType === "assicurazione" ? "Compagnia Assicurativa" : "Ente / Gestore Fondo"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      protType === "pac"
                        ? "Es. Trade Republic, Scalable, Directa, Fineco, Moneyfarm..."
                        : protType === "assicurazione"
                        ? "Es. Allianz, Generali, UnipolSai..."
                        : "Es. Fondo Cometa, Fondo Fon.Te, Amundi..."
                    }
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                      Importo (€)
                    </label>
                    <input
                      type="text"
                      placeholder="Es. 150 o 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                      Tipo importo
                    </label>
                    <select
                      value={amountType}
                      onChange={(e) => setAmountType(e.target.value as ProtectionItem["amountType"])}
                      className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none"
                    >
                      <option value="premio_mensile">Versamento mensile</option>
                      <option value="premio_annuale">Premio / Versamento annuo</option>
                      <option value="valore_maturato">Capitale maturato / accumulato</option>
                      <option value="versamento_periodico">Versamento periodico</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                      {protType === "pac" ? "Frequenza / Orizzonte" : "Scadenza / Rinnovo"}
                    </label>
                    <input
                      type="text"
                      placeholder={protType === "pac" ? "Es. 1° del mese o 2035" : "Es. 15 Maggio o 2050"}
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                      Codice / N° Contratto
                    </label>
                    <input
                      type="text"
                      placeholder="Opzionale"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 rounded-full bg-[#0B0B0B] text-white font-black text-sm hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Salva posizione
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
