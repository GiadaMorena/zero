"use client";

import React, { useState } from "react";
import { Plus, Trash2, CreditCard, ArrowRight, X, Wallet, Eye, EyeOff, Layers, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getCardAppearance } from "@/lib/cardAppearance";
import { CardChip } from "./BankCardDetails";

/* ─── Add Card Modal ─────────────────────────────────────── */
function AddCardModal({
  onClose,
  defaultHolderName,
}: {
  onClose: () => void;
  defaultHolderName: string;
}) {
  const { addCard } = useApp();
  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState(defaultHolderName);
  const [last4, setLast4] = useState("");
  const [expiry, setExpiry] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) {
      setError("Inserisci il nome della banca o istituto");
      return;
    }
    if (!last4.trim() || last4.length < 4) {
      setError("Inserisci le ultime 4 cifre della carta");
      return;
    }
    addCard({
      bankName: bankName.trim(),
      name: holderName.trim() || defaultHolderName,
      number: `•••• ${last4.trim()}`,
      expiry: expiry.trim() || "00/00",
      balance: parseFloat(balance.replace(",", ".")) || 0,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B0B0B]/60 backdrop-blur-xs p-0 sm:p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleAdd}
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-[#F7F7F5] p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 1.5rem)" }}
      >
        {/* Header with dual Action: Annulla / Titolo / Aggiungi */}
        <div className="flex items-center justify-between pb-3 border-b border-[#A7A7A7]/15">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-full bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <h2 className="text-base font-black text-[#0B0B0B] tracking-tight">
            Aggiungi nuova carta
          </h2>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-full bg-[#FDC909] text-[#0B0B0B] text-xs font-black shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            Aggiungi
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {/* Banca */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
              Banca / Istituto *
            </label>
            <input
              type="text"
              placeholder="Es: Revolut, Intesa, Fineco, Poste..."
              value={bankName}
              onChange={(e) => {
                setError("");
                setBankName(e.target.value);
              }}
              autoFocus
              required
              className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
              style={{ height: "48px" }}
            />
          </div>

          {/* Intestatario */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
              Intestatario carta
            </label>
            <input
              type="text"
              placeholder="Nome e cognome"
              value={holderName}
              onChange={(e) => {
                setError("");
                setHolderName(e.target.value);
              }}
              className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
              style={{ height: "48px" }}
            />
          </div>

          {/* Ultime 4 cifre & Scadenza in grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
                Ultime 4 cifre *
              </label>
              <input
                type="tel"
                placeholder="1234"
                maxLength={4}
                value={last4}
                onChange={(e) => {
                  setError("");
                  setLast4(e.target.value.replace(/\D/g, "").slice(0, 4));
                }}
                required
                className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
                style={{ height: "48px" }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
                Scadenza (MM/AA)
              </label>
              <input
                type="tel"
                placeholder="12/28"
                maxLength={5}
                value={expiry}
                onChange={(e) => {
                  setError("");
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setExpiry(raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw);
                }}
                className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
                style={{ height: "48px" }}
              />
            </div>
          </div>

          {/* Saldo iniziale */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
              Saldo iniziale (€)
            </label>
            <input
              type="number"
              placeholder="0,00"
              value={balance}
              onChange={(e) => {
                setError("");
                setBalance(e.target.value);
              }}
              className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
              style={{ height: "48px" }}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs font-bold text-[#0B0B0B] bg-[#FDC909] px-3 py-1.5 rounded-xl text-center animate-in fade-in">
            {error}
          </p>
        )}

        {/* Big CTA Button at bottom */}
        <button
          type="submit"
          className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-between p-1.5 hover:bg-black active:scale-[0.98] transition-all cursor-pointer group mt-2 shadow-lg"
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
  isSelected,
  onSelect,
  onDelete,
}: {
  bankName: string;
  number: string;
  expiry: string;
  balance: number;
  holderName: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      onClick={onSelect}
      style={getCardAppearance(bankName)}
      className={`relative rounded-[24px] bg-[#0B0B0B] text-[#F7F7F5] p-5 overflow-hidden shadow-md transition-all ${
        isSelected ? "ring-2 ring-[#FDC909]" : ""
      }`}
    >
      {/* Ambient subtle glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FDC909]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top row: Bank name + Balance on Left | Icons and Actions on Right */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-extrabold tracking-tight">
                {bankName}
              </p>
              {isSelected && (
                <span className="text-[9px] font-black bg-[#FDC909] text-[#0B0B0B] px-1.5 py-0.2 rounded-full">
                  Attiva
                </span>
              )}
            </div>
            <p className="text-2xl font-black tracking-tight mt-0.5">
              {balance.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
            </p>
          </div>

          {/* Top Right Action & Card Badge (No Overlap) */}
          <div className="flex items-center gap-2">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-[#A7A7A7] transition-colors cursor-pointer"
                title="Elimina carta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-red-500/20 rounded-full px-2.5 py-1 border border-red-500/40 animate-in fade-in"
              >
                <span className="text-[10px] font-bold text-red-200">Elimina?</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-[10px] font-black text-red-400 hover:text-red-300 transition-colors cursor-pointer px-1"
                >
                  Sì
                </button>
                <span className="text-[#A7A7A7]">·</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                  className="text-[10px] font-black text-[#A7A7A7] hover:text-[#F7F7F5] transition-colors cursor-pointer px-1"
                >
                  No
                </button>
              </div>
            )}

            <div className="h-8 w-8 rounded-full bg-[#FDC909]/20 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-[#FDC909]" />
            </div>
          </div>
        </div>

        {/* Card number */}
        <div className="mb-3"><CardChip /></div>
        <p className="text-sm font-mono font-bold tracking-widest mb-5">
          {number}
        </p>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] opacity-75 uppercase tracking-wider">
              Intestatario
            </p>
            <p className="text-xs font-bold">{holderName}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] opacity-75 uppercase tracking-wider">
              Scadenza
            </p>
            <p className="text-xs font-bold">{expiry === "00/00" ? "—" : expiry}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CarteScreen ────────────────────────────────────────── */
export function CarteScreen() {
  const {
    cards,
    activeCardIndex,
    setActiveCardIndex,
    deleteCard,
    transactions,
    profile,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [selectedCardFilterIds, setSelectedCardFilterIds] = useState<string[]>([]);

  const holderName = profile.name || "Utente";

  const totalBalance = cards.reduce((acc, c) => acc + (c.balance || 0), 0);

  const isAllSelected = selectedCardFilterIds.length === 0;

  const handleToggleCardFilter = (cardId: string) => {
    setSelectedCardFilterIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  const handleSelectAllCards = () => {
    setSelectedCardFilterIds([]);
  };

  const activeFilteredCards = isAllSelected
    ? cards
    : cards.filter((c) => selectedCardFilterIds.includes(c.id));

  const activeFilteredTotal = activeFilteredCards.reduce(
    (acc, c) => acc + (c.balance || 0),
    0
  );

  // Filter transactions based on selected card filter
  const displayedTransactions = isAllSelected
    ? transactions
    : transactions.filter((t) => selectedCardFilterIds.includes(t.cardId));

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">
            Le mie carte
          </h1>
          <p className="text-xs text-[#A7A7A7] font-medium mt-0.5">
            {cards.length} {cards.length === 1 ? "carta collegata" : "carte collegate"}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-9 w-9 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          title="Aggiungi carta"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Total Balance Overview Widget */}
      {cards.length > 0 && (
        <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-4.5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-wider">
                {isAllSelected
                  ? "Patrimonio Totale Disponibile"
                  : `Totale Selezionato (${selectedCardFilterIds.length} ${
                      selectedCardFilterIds.length === 1 ? "carta" : "carte"
                    })`}
              </p>
              <p className="text-2xl font-black text-[#0B0B0B] tracking-tight mt-0.5">
                {money(activeFilteredTotal)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-xs">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          {/* Multi-Select filter chips for cards */}
          {cards.length > 1 && (
            <div className="pt-2 border-t border-[#A7A7A7]/10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider">
                  Filtra e combina più carte:
                </p>
                {!isAllSelected && (
                  <button
                    type="button"
                    onClick={handleSelectAllCards}
                    className="text-[10px] font-extrabold text-[#0B0B0B] underline cursor-pointer"
                  >
                    Resetta a Tutte
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  type="button"
                  onClick={handleSelectAllCards}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    isAllSelected
                      ? "bg-[#0B0B0B] text-[#F7F7F5]"
                      : "bg-[#F7F7F5] border border-[#A7A7A7]/20 text-[#A7A7A7] hover:text-[#0B0B0B]"
                  }`}
                >
                  Tutte ({money(totalBalance)})
                </button>
                {cards.map((c) => {
                  const isChecked = selectedCardFilterIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleCardFilter(c.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-[#FDC909] text-[#0B0B0B] shadow-2xs"
                          : "bg-[#F7F7F5] border border-[#A7A7A7]/20 text-[#A7A7A7] hover:text-[#0B0B0B]"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      <span>
                        {c.bankName} ({money(c.balance)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center bg-white rounded-[26px] border border-[#A7A7A7]/20 shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-[#0B0B0B] flex items-center justify-center shadow-sm">
            <CreditCard className="h-8 w-8 text-[#FDC909]" />
          </div>
          <div>
            <p className="text-base font-black text-[#0B0B0B]">Nessuna carta presente</p>
            <p className="text-xs text-[#A7A7A7] font-semibold mt-1">
              Aggiungi la tua prima carta per iniziare a gestire le tue spese.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full max-w-xs h-12 rounded-full bg-[#0B0B0B] text-[#F7F7F5] text-xs font-black cursor-pointer hover:bg-black active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4 text-[#FDC909]" />
            <span>Aggiungi carta</span>
          </button>
        </div>
      )}

      {/* Cards list */}
      {cards.length > 0 && (
        <div className="flex flex-col gap-3">
          {cards.map((card, idx) => (
            <CardVisual
              key={card.id}
              bankName={card.bankName}
              number={card.number}
              expiry={card.expiry}
              balance={card.balance}
              holderName={card.name || holderName}
              isSelected={activeCardIndex === idx}
              onSelect={() => setActiveCardIndex(idx)}
              onDelete={() => deleteCard(card.id)}
            />
          ))}

          {/* Large prominent "Aggiungi un'altra carta" button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full h-14 rounded-[22px] bg-white border-2 border-dashed border-[#A7A7A7]/40 text-[#0B0B0B] text-xs font-black flex items-center justify-center gap-2 hover:border-[#0B0B0B] hover:bg-[#F7F7F5] active:scale-[0.99] transition-all cursor-pointer shadow-2xs mt-1"
          >
            <div className="h-6 w-6 rounded-full bg-[#0B0B0B] text-[#FDC909] flex items-center justify-center">
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <span>Aggiungi un&apos;altra carta</span>
          </button>
        </div>
      )}

      {/* Recent transactions per card */}
      {cards.length > 0 && (
        <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-[#0B0B0B]">
              Movimenti{" "}
              {!isAllSelected
                ? `(${selectedCardFilterIds.length} ${
                    selectedCardFilterIds.length === 1 ? "carta filtrata" : "carte filtrate"
                  })`
                : "recenti"}
            </h3>
            {!isAllSelected && (
              <button
                type="button"
                onClick={handleSelectAllCards}
                className="text-[10px] font-bold text-[#A7A7A7] hover:text-[#0B0B0B] cursor-pointer"
              >
                Mostra tutte
              </button>
            )}
          </div>

          {displayedTransactions.length === 0 ? (
            <p className="text-[11px] text-[#A7A7A7] text-center py-4">
              Nessun movimento per questa selezione
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {displayedTransactions.slice(0, 5).map((tx) => {
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
                    <span className="text-xs font-black text-[#0B0B0B]">
                      {tx.amount < 0 ? "- " : "+ "}
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
        <AddCardModal
          onClose={() => setShowModal(false)}
          defaultHolderName={holderName}
        />
      )}
    </div>
  );
}
