"use client"

import { useState } from "react"
import { CreditCard, CreditCardIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { BankIdentifier, PaymentCard } from "@/Models/Payments"

interface PaymentOverlayProps {
    currentPaymentCard: PaymentCard | null,
    bankList: Array<BankIdentifier>,
    setPaymentCard: (method: PaymentCard) => void
}


export default function PaymentOverlay(props: PaymentOverlayProps) {
    const [error, setError] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newCard, setNewCard] = useState<PaymentCard>(props.currentPaymentCard !== null ? props.currentPaymentCard : {
        bank: {
            bankCode: "---",
            bankName: "Choose a bank..."
        },
        accountNumber: "",
        cardHolderName: "",
        isDefault: true
    })

    const handleAddCard = () => {
        try {
            if (!newCard || newCard.bank.bankName === "Choose a bank..." ||
                newCard.accountNumber === "" || newCard.cardHolderName==="") {
                setError("All fields are required");
                return;
            }
            setError("")
            props.setPaymentCard(newCard);

            //make a request
        }
        catch (e) {
            //TODO:handle exception
        }
        setIsAddDialogOpen(false)
    }


    return (
        <div className="w-full max-w-sm">

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger className="p-2 rounded-md border border-border bg-[#3ebb9e] hover:bg-[#00674f] text-white" >
                    <Plus className="h-4 w-4 mr-2 inline" />
                    Add Payment Method
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle><CreditCardIcon className="inline mr-2"/>Add Payment Card</DialogTitle>
                        <DialogDescription>Enter your payment information to add a new card.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Bank Name</Label>
                            <Select onValueChange={(value) => {
                                const selectedBank:BankIdentifier|undefined = props.bankList.find((bank) => bank.bankCode === value);
                                setNewCard({
                                    ...newCard,
                                    bank: {
                                        bankCode: selectedBank?selectedBank.bankCode:"",
                                        bankName: selectedBank?selectedBank.bankName:""
                                    }
                                })
                                }}
                            >

                                <SelectTrigger className="bg-muted">
                                    <SelectValue placeholder={newCard.bank.bankName || "Select a bank"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.bankList.map((bank) => (
                                        <SelectItem key={bank.bankCode} value={bank.bankCode}>
                                            {bank.bankName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                {/* </Select> */}
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Cardholder Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={newCard.cardHolderName}
                                onChange={(e) => setNewCard({ ...newCard, cardHolderName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="number">Account Number</Label>
                            <Input
                                id="number"
                                placeholder="1234 5678 9012 3456"
                                value={newCard.accountNumber}
                                onChange={(e) => setNewCard({ ...newCard, accountNumber: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddCard} className="bg-[#3ebb9e] hover:bg-[#00674f] text-white">Add Card</Button>

                    </DialogFooter>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </DialogContent>
            </Dialog>

        </div>
    )
}
