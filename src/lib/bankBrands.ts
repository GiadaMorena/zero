export const normalizeBankName = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const bankBrands = [
  { match: /\b(intesa|sanpaolo|isp)\b/, label: "Intesa Sanpaolo", file: "intesa-sanpaolo.png", plate: true },
  { match: /\brevolut\b/, label: "Revolut", file: "revolut.svg" },
  { match: /\bfineco(?:bank)?\b/, label: "Fineco", file: "fineco-wordmark.svg" },
  { match: /\ballianz\b/, label: "Allianz", file: "allianz-wordmark.svg" },
  { match: /\buni\s?credit\b/, label: "UniCredit", file: "unicredit.svg" },
  { match: /\bn\s?26\b/, label: "N26", file: "n26.png", compact: true },
  { match: /\b(postepay|poste pay)\b/, label: "PostePay", file: "postepay.svg" },
  { match: /\b(bancoposta|banco posta|poste|postamat)\b/, label: "BancoPosta", file: "bancoposta.gif", postalCrop: true },
  { match: /\b(ing|conto arancio)\b/, label: "ING", file: "ing.svg", white: true },
  { match: /\bbper\b/, label: "BPER", file: "bper.svg", white: true },
  { match: /\bbbva\b/, label: "BBVA", file: "bbva.png", white: true },
  { match: /\bhype\b/, label: "HYPE", file: "hype.svg", compact: true },
  { match: /\bsella\b/, label: "Banca Sella", file: "sella.svg", white: true },
  { match: /\bcredit agricole\b/, label: "Crédit Agricole", file: "creditagricole.png", white: true },
] as const;
export function getBankBrand(name: string) { const normalized = normalizeBankName(name); return bankBrands.find(brand => brand.match.test(normalized)); }
