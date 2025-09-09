"use client"

import { useState } from "react"
import { CreditCardIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { BankIdentifier, PayoutCard } from "@/Models/Payout"
import { profileService } from "@/services/profileServices"

interface PaymentOverlayProps {
    process: "add" | "edit"
    currentPayoutCard: PayoutCard | null,
    bankList: Array<BankIdentifier>,
    setPaymentCard: (method: PayoutCard) => void,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
}

export default function PaymentOverlay({
    process = "add",
    currentPayoutCard,
    bankList,
    setPaymentCard,
    isOpen,
    onOpenChange
}: PaymentOverlayProps) {
    const [error, setError] = useState("");
    const [newCard, setNewCard] = useState<PayoutCard>(currentPayoutCard !== null ? currentPayoutCard : {
        bank: {
            code: "---",
            name: "Choose a bank..."
        },
        accountNumber: "",
        accountHolder: "",
    })

    // Reset form when dialog opens
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setNewCard(currentPayoutCard !== null ? currentPayoutCard : {
                bank: {
                    code: "---",
                    name: "Choose a bank..."
                },
                accountNumber: "",
                accountHolder: "",
            })
            setError("")
        }
        onOpenChange(open)
    }

    const handleSubmit = () => {
        try {
            if (!newCard || newCard.bank.name === "Choose a bank..." ||
                newCard.accountNumber === "" || newCard.accountHolder === "") {
                setError("All fields are required");
                return;
            }
            setError("")
            if (process === "add") {
                //make POST request
                profileService.addPayoutCard(newCard)
                    .then(() => {
                        setPaymentCard(newCard);
                        onOpenChange(false)
                    })
                    .catch((error: Error) => {
                        setError(error.message);
                    })
            }
            else {
                if (newCard.accountNumber === currentPayoutCard?.accountNumber
                    && newCard.accountHolder === currentPayoutCard?.accountHolder
                    && newCard.bank.code === currentPayoutCard?.bank.code
                    && newCard.bank.name === currentPayoutCard?.bank.name) {
                    setError("No changes were made")
                    return
                }
                //make PUT request
                profileService.updatePayoutCard(newCard)
                    .then(() => {
                        setPaymentCard(newCard);
                        onOpenChange(false)
                    })
                    .catch((error: Error) => {
                        setError(error.message);
                    })
            }
        }
        catch (e) {
            //TODO:handle exception
        }
    }

    const handleBankChange = (value: string) => {
        const selectedBank: BankIdentifier | undefined = bankList.find((bank) => bank.code === value);
        setNewCard({
            ...newCard,
            bank: {
                code: selectedBank ? selectedBank.code : "",
                name: selectedBank ? selectedBank.name : ""
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-muted">
                <DialogHeader>
                    <DialogTitle>
                        <CreditCardIcon className="inline mr-2" />
                        {process === "add" ? "Add Payment Method" : "Edit Payment Method"}
                    </DialogTitle>
                    <DialogDescription>
                        {process === "add"
                            ? "Enter your payout information to add a new card."
                            : "Update your payout information."
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 bg-muted">
                    <div className="grid gap-2 bg-muted">
                        <Label htmlFor="name">Bank Name</Label>
                        <Select onValueChange={handleBankChange} value={newCard.bank.code}>
                            <SelectTrigger className="w-full bg-muted">
                                <SelectValue placeholder="Choose Bank" />
                            </SelectTrigger>
                            <SelectContent className="custom-scrollbar max-h-[200px] overflow-y-auto bg-muted">
                                {bankList.map((bank) => (
                                    <SelectItem key={bank.code} value={bank.code} className="bg-muted hover:bg-muted/80">
                                        {bank.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2 bg-muted">
                        <Label htmlFor="name">Cardholder Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter cardholder name..."
                            value={newCard.accountHolder}
                            onChange={(e) => setNewCard({ ...newCard, accountHolder: e.target.value })}
                            className="bg-muted"
                        />
                    </div>
                    <div className="grid gap-2 bg-muted">
                        <Label htmlFor="number">Account Number</Label>
                        <Input
                            id="number"
                            placeholder="Enter account number..."
                            value={newCard.accountNumber}
                            onChange={(e) => setNewCard({ ...newCard, accountNumber: e.target.value })}
                            className="bg-muted"
                        />
                    </div>
                </div>
                <DialogFooter className="bg-muted">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-muted hover:bg-muted/80">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">
                        {process === "add" ? "Add Payment Method" : "Save Changes"}
                    </Button>
                </DialogFooter>
                {error && <p className="text-red-500 text-sm mt-2 bg-muted">{error}</p>}
            </DialogContent>
        </Dialog>
    )
}