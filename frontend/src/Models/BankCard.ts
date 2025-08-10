const cardColor = {
  "absa": "red",
  "african bank": "green",
  "bidvest": "red",
  "capitec": "green",
  "discovery": "purple",
  "first national bank": "green",
  "nedbank": "green",
  "standard bank": "blue",
  "tymebank": "yellow",
} as const;

type BankKey = keyof typeof cardColor;

export function getCardColor(input: string): string {
  const normalizedInput = input.trim().toLowerCase();

  for (const bank of Object.keys(cardColor)) {
    if (normalizedInput.startsWith(bank)) {
      return cardColor[bank as BankKey];
    }
  }
  return "black"; // default if no match
}