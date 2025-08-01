export interface PayoutCard {
    bank: BankIdentifier
    accountNumber: string
    accountHolder: string
}

export interface BankIdentifier {
    code: string
    name: string
}