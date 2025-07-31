export interface PaymentCard {
    bank: BankIdentifier
    accountNumber: string
    cardHolderName: string
    isDefault: boolean
}

export interface BankIdentifier {
    code: string
    name: string
}