"use client"

import { useState } from "react"
import { CreditCardIcon, Plus } from "lucide-react"
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
    process:"add"|"edit"
    currentPaymentCard: PaymentCard | null,
    bankList: Array<BankIdentifier>,
    setPaymentCard: (method: PaymentCard) => void
}


export default function PaymentOverlay({process="add",currentPaymentCard,bankList,setPaymentCard}: PaymentOverlayProps) {
    const [error, setError] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newCard, setNewCard] = useState<PaymentCard>(currentPaymentCard !== null ? currentPaymentCard : {
        bank: {
            code: "---",
            name: "Choose a bank..."
        },
        accountNumber: "",
        cardHolderName: "",
        isDefault: true
    })

    const handleAddCard = () => {
        try {
            if (!newCard || newCard.bank.name === "Choose a bank..." ||
                newCard.accountNumber === "" || newCard.cardHolderName === "") {
                setError("All fields are required");
                return;
            }
            setError("")
            setPaymentCard(newCard);
            if(process==="add"){
                //make POST request
                
            }
            else{
                //make PATCH request

            }
        }
        catch (e) {
            //TODO:handle exception
        }
        setIsAddDialogOpen(false)
    }


    return (
        <div className="w-full max-w-sm">

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                {process==="add"?
                    <DialogTrigger className="p-2 rounded-md border border-border bg-[#3ebb9e] hover:bg-[#00674f] text-white" >
                        <Plus className="h-4 w-4 mr-2 inline" />
                        Add Payment Method
                    </DialogTrigger>
                    :
                    <DialogTrigger className="p-2" >
                        Edit
                    </DialogTrigger>

                }
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle><CreditCardIcon className="inline mr-2" />Add Payment Card</DialogTitle>
                        <DialogDescription>Enter your payment information to add a new card.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Bank Name</Label>
                            <Select onValueChange={(value) => {
                                const selectedBank: BankIdentifier | undefined = bankList.find((bank) => bank.code === value);
                                setNewCard({
                                    ...newCard,
                                    bank: {
                                        code: selectedBank ? selectedBank.code : "",
                                        name: selectedBank ? selectedBank.name : ""
                                    }
                                })
                            }}
                            >

                                <SelectTrigger className="bg-muted">
                                    <SelectValue placeholder={newCard.bank.name || "Select a bank"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    {bankList.map((bank) => (
                                        <SelectItem key={bank.code} value={bank.code}>
                                            {bank.name}
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
