export interface PayoutCard {
    bank: BankIdentifier
    accountNumber: string
    cardHolderName: string
}

export interface BankIdentifier {
    code: string
    name: string
}