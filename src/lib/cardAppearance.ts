import type { CSSProperties } from "react";
import { normalizeBankName } from "./bankBrands";

// Illustrations inspired by each bank's visual identity; no payment network is inferred.
const bankThemes = [
  { names: ["revolut"], colors: ["#ececff", "#a4b6ed", "#ecd4e8"], ink: "#171b39" },
  { names: ["intesa", "sanpaolo", "isp"], colors: ["#075c48", "#168b68", "#073d33"], ink: "#ffffff" },
  { names: ["unicredit", "uni credit"], colors: ["#a40b22", "#ea2441", "#630718"], ink: "#ffffff" },
  { names: ["fineco"], colors: ["#082b68", "#2459b2", "#061a42"], ink: "#ffffff" },
  { names: ["allianz"], colors: ["#003781", "#1464a5", "#002455"], ink: "#ffffff" },
  { names: ["n26", "n 26"], colors: ["#a5d9d0", "#d7ece5", "#70b6ac"], ink: "#143d38" },
  { names: ["postepay", "poste pay", "poste", "bancoposta", "banco posta"], colors: ["#ffe25c", "#ffc928", "#e9b51c"], ink: "#133463" },
  { names: ["ing", "conto arancio"], colors: ["#ec6506", "#ff9b36", "#ba4400"], ink: "#ffffff" },
  { names: ["bper"], colors: ["#005c51", "#168778", "#003d38"], ink: "#ffffff" },
  { names: ["bbva"], colors: ["#043b7a", "#147dbe", "#052655"], ink: "#ffffff" },
  { names: ["hype"], colors: ["#2637a9", "#567ef2", "#172176"], ink: "#ffffff" },
  { names: ["sella"], colors: ["#07306a", "#337ac2", "#041d43"], ink: "#ffffff" },
  { names: ["credit agricole", "crédit agricole"], colors: ["#006b61", "#299689", "#004139"], ink: "#ffffff" },
  { names: ["zero"], colors: ["#171713", "#393524", "#0b0b0b"], ink: "#fff8dc" },
  { names: ["bpm", "banco popolare"], colors: ["#042f5f", "#297b96", "#021e3e"], ink: "#ffffff" },
  { names: ["mps", "montepaschi", "monte dei paschi"], colors: ["#781d32", "#b5455c", "#4c1221"], ink: "#ffffff" },
  { names: ["bnl", "banca nazionale del lavoro"], colors: ["#006b52", "#249b78", "#004132"], ink: "#ffffff" },
  { names: ["mediolanum"], colors: ["#202967", "#1e96d7", "#141a46"], ink: "#ffffff" },
  { names: ["credem", "credito emiliano"], colors: ["#00633f", "#3b9564", "#003f29"], ink: "#ffffff" },
  { names: ["widiba"], colors: ["#681b75", "#bd4fb5", "#401249"], ink: "#ffffff" },
  { names: ["illimity"], colors: ["#a03039", "#ed715d", "#6d1c2c"], ink: "#ffffff" },
  { names: ["deutsche bank", "deutschebank"], colors: ["#0018a8", "#2765cf", "#001268"], ink: "#ffffff" },
  { names: ["ifis"], colors: ["#123a74", "#4bb0fa", "#0a254d"], ink: "#ffffff" },
];

const fallbackColors = [
  ["#343a83", "#677aca", "#232953"],
  ["#65416e", "#aa79a6", "#402c50"],
  ["#125e71", "#3596a5", "#123d50"],
  ["#805334", "#b68d66", "#573a2b"],
];

export function getCardAppearance(bankName: string): CSSProperties {
  const normalized = normalizeBankName(bankName);
  const theme = bankThemes.find(({ names }) => names.some((name) =>
    name === "ing" || name === "isp"
      ? normalized.split(/[^\p{L}\p{N}]+/u).includes(name)
      : normalized.includes(name)
  ));
  let hash = 0;
  for (const char of normalized) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const colors = theme?.colors ?? fallbackColors[hash % fallbackColors.length];
  return {
    background: `radial-gradient(ellipse at 90% 0%, ${colors[1]} 0%, transparent 62%), repeating-linear-gradient(125deg, transparent 0 28px, #ffffff07 29px 30px), linear-gradient(125deg, ${colors[0]}, ${colors[2]})`,
    color: theme?.ink ?? "#ffffff",
    border: "1px solid #ffffff30",
  };
}
