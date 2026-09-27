"use client";

import React, { useState } from "react";
import { Plus, Trash2, CreditCard, ArrowRight, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

/* ─── Add Card Modal ─────────────────────────────────────── */
function AddCardModal({ onClose, holderName }: { onClose: () => void; holderName: string }) {
  const { addCard } = useApp();
  const [bankName, setBankName] = useState("");
  const [last4, setLast4] = useState("");
  const [expiry, setExpiry] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!bankName.trim()) { setError("Inserisci il nome della banca"); return; }
    if (!last4.trim() || last4.length < 4) { setError("Inserisci le ultime 4 cifre"); return; }
    addCard({
      bankName: bankName.trim(),
      name: holderName,
      number: `•••• ${last4}`,
      expiry: expiry || "00/00",
      balance: parseFloat(balance) || 0,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(11,11,11,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleAdd}
        className="w-full max-w-md rounded-t-[32px] bg-[#F7F7F5] p-6 flex flex-col gap-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 1.5rem)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-black text-[#0B0B0B] tracking-tight">Aggiungi carta</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Fields */}
        {[
          { label: "Banca / Istituto", placeholder: "Revolut, Intesa, Fineco...", value: bankName, onChange: (v: string) => { setError(""); setBankName(v); }, type: "text" },
          { label: "Ultime 4 cifre", placeholder: "1234", value: last4, onChange: (v: string) => { setError(""); setLast4(v.replace(/\D/g, "").slice(0, 4)); }, type: "tel" },
          { label: "Scadenza (opzionale)", placeholder: "MM/AA", value: expiry, onChange: (v: string) => {
            setError("");
            const raw = v.replace(/\D/g, "").slice(0, 4);
            setExpiry(raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw);
          }, type: "tel" },
          { label: "Saldo iniziale (opzionale)", placeholder: "0.00", value: balance, onChange: (v: string) => { setError(""); setBalance(v); }, type: "number" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
              {f.label}
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
              style={{ height: "48px" }}
            />
          </div>
        ))}

        {error && (
          <p className="text-xs font-bold text-[#0B0B0B] bg-[#FDC909] px-3 py-1.5 rounded-xl text-center">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          type="submit"
          className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-between p-1.5 hover:bg-black active:scale-[0.98] transition-all cursor-pointer group mt-1"
        >
          <div className="w-11 h-11 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
          <span className="flex-1 text-center pr-6 tracking-wide font-extrabold text-[#F7F7F5]">
            Aggiungi carta
          </span>
        </button>
      </form>
    </div>
  );
}

/* ─── Card Visual ────────────────────────────────────────── */
function CardVisual({
  bankName,
  number,
  expiry,
  balance,
  holderName,
  onDelete,
}: {
  bankName: string;
  number: string;
  expiry: string;
  balance: number;
  holderName: string;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="relative rounded-[24px] bg-[#0B0B0B] text-[#F7F7F5] p-5 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FDC909]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-widest">{bankName}</p>
            <p className="text-xl font-black tracking-tight mt-0.5">
              {balance.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
            </p>
          </div>
          <CreditCard className="h-5 w-5 text-[#FDC909]" />
        </div>

        {/* Card number */}
        <p className="text-sm font-mono font-bold tracking-widest text-[#F7F7F5] mb-4">{number}</p>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-[#A7A7A7] uppercase tracking-wider">Intestatario</p>
            <p className="text-xs font-bold">{holderName}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-[#A7A7A7] uppercase tracking-wider">Scadenza</p>
            <p className="text-xs font-bold">{expiry}</p>
          </div>
        </div>
      </div>

      {/* Delete controls */}
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[#A7A7A7] hover:text-red-400 hover:bg-white/20 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0B0B0B]/90 rounded-full px-3 py-1.5 border border-white/10">
          <span className="text-[10px] font-bold text-[#F7F7F5]">Elimina?</span>
          <button
            onClick={onDelete}
            className="text-[10px] font-black text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            Sì
          </button>
          <span className="text-[#A7A7A7]">·</span>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-[10px] font-black text-[#A7A7A7] hover:text-[#F7F7F5] transition-colors cursor-pointer"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── CarteScreen ────────────────────────────────────────── */
export function CarteScreen() {
  const { cards, deleteCard, transactions, profile } = useApp();
  const [showModal, setShowModal] = useState(false);

  const holderName = profile.name || "Utente";

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">Le mie carte</h1>
        <button
          onClick={() => setShowModal(true)}
          className="h-9 w-9 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
          <div className="h-16 w-16 rounded-3xl bg-[#0B0B0B] flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-[#FDC909]" />
          </div>
          <div>
            <p className="text-sm font-black text-[#0B0B0B]">Nessuna carta aggiunta</p>
            <p className="text-xs text-[#A7A7A7] font-medium mt-1">
              Aggiungi la tua prima carta per iniziare a tracciare le spese.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-full bg-[#0B0B0B] text-[#F7F7F5] text-xs font-black cursor-pointer hover:bg-black active:scale-95 transition-all"
          >
            Aggiungi carta
          </button>
        </div>
      )}

      {/* Cards list */}
      {cards.length > 0 && (
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <CardVisual
              key={card.id}
              bankName={card.bankName}
              number={card.number}
              expiry={card.expiry}
              balance={card.balance}
              holderName={card.name || holderName}
              onDelete={() => deleteCard(card.id)}
            />
          ))}
        </div>
      )}

      {/* Recent transactions per card */}
      {cards.length > 0 && (
        <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-4">
          <h3 className="text-xs font-extrabold text-[#0B0B0B] mb-3">Ultimi movimenti</h3>

          {transactions.length === 0 ? (
            <p className="text-[11px] text-[#A7A7A7] text-center py-4">
              Nessun movimento registrato
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.slice(0, 5).map((tx) => {
                const card = cards.find((c) => c.id === tx.cardId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F5] border border-[#A7A7A7]/10"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0B0B0B]">{tx.title}</p>
                      <p className="text-[10px] text-[#A7A7A7]">
                        {card ? card.bankName : "—"} · {tx.date}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-black ${
                        tx.amount < 0 ? "text-[#0B0B0B]" : "text-[#0B0B0B]"
                      }`}
                    >
                      {tx.amount < 0 ? "-" : "+"}
                      {Math.abs(tx.amount).toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Card Modal */}
      {showModal && (
        <AddCardModal onClose={() => setShowModal(false)} holderName={holderName} />
      )}
    </div>
  );
}
