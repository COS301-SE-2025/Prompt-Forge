const cardColor = {
  "absa": "red",
  "african bank": "green",
  "bidvest": "red",
  "capitec": "green",
  "discovery": "purple",
  "first national bank": "green",
  "fnb": "green", // Add common abbreviation
  "nedbank": "green",
  "standard bank": "blue",
  "tymebank": "yellow",
  null:"black"
} as const;

type BankKey = keyof typeof cardColor;
type ColorValue = typeof cardColor[BankKey];

export function getCardColor(input: string): ColorValue {
  const normalizedInput = input.trim().toLowerCase();

  // First try exact match
  if (normalizedInput in cardColor) {
    return cardColor[normalizedInput as BankKey];
  }

  // Then try partial match (starts with)
  for (const bank of Object.keys(cardColor) as BankKey[]) {
    if (normalizedInput.includes(bank) || normalizedInput.startsWith(bank)) {
      return cardColor[bank];
    }
  }

  return "black"; // default if no match
}