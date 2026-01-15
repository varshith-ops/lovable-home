import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Building2, Shield, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PaymentMethod = "debit" | "credit" | "upi";

interface PaymentFormProps {
  totalAmount: number;
  onPaymentSubmit: (method: PaymentMethod) => void;
  isProcessing: boolean;
}

const PaymentForm = ({ totalAmount, onPaymentSubmit, isProcessing }: PaymentFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("debit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : "";
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + "/" + numbers.substring(2, 4);
    }
    return numbers;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentSubmit(selectedMethod);
  };

  const isCardFormValid = () => {
    return cardNumber.replace(/\s/g, "").length === 16 && 
           cardName.length >= 3 && 
           expiry.length === 5 && 
           cvv.length >= 3;
  };

  const isUpiFormValid = () => {
    return upiId.includes("@") && upiId.length >= 5;
  };

  const isFormValid = () => {
    if (selectedMethod === "upi") return isUpiFormValid();
    return isCardFormValid();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <Label className="text-foreground font-medium mb-3 block">Select Payment Method</Label>
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
          className="grid grid-cols-3 gap-3"
        >
          <div>
            <RadioGroupItem value="debit" id="debit" className="peer sr-only" />
            <Label
              htmlFor="debit"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-secondary/50 p-4 cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
            >
              <CreditCard className="w-6 h-6 mb-2 text-primary" />
              <span className="text-sm font-medium text-foreground">Debit Card</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
            <Label
              htmlFor="credit"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-secondary/50 p-4 cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
            >
              <Building2 className="w-6 h-6 mb-2 text-primary" />
              <span className="text-sm font-medium text-foreground">Credit Card</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
            <Label
              htmlFor="upi"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-secondary/50 p-4 cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
            >
              <Smartphone className="w-6 h-6 mb-2 text-primary" />
              <span className="text-sm font-medium text-foreground">UPI</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Card Form */}
      {(selectedMethod === "debit" || selectedMethod === "credit") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="cardNumber" className="text-muted-foreground text-sm">
              Card Number
            </Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="bg-secondary border-border text-foreground pl-10"
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="cardName" className="text-muted-foreground text-sm">
              Cardholder Name
            </Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry" className="text-muted-foreground text-sm">
                Expiry Date
              </Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="cvv" className="text-muted-foreground text-sm">
                CVV
              </Label>
              <div className="relative">
                <Input
                  id="cvv"
                  type="password"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                  maxLength={4}
                  className="bg-secondary border-border text-foreground"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* UPI Form */}
      {selectedMethod === "upi" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="upiId" className="text-muted-foreground text-sm">
              UPI ID
            </Label>
            <div className="relative">
              <Input
                id="upiId"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="bg-secondary border-border text-foreground pl-10"
              />
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter your UPI ID (e.g., name@paytm, name@gpay, name@phonepe)
            </p>
          </div>

          {/* Popular UPI Apps */}
          <div className="flex gap-3 justify-center pt-2">
            {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
              <div
                key={app}
                className="px-4 py-2 bg-secondary/50 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary/50 cursor-pointer transition-all"
              >
                {app}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 py-3 bg-secondary/30 rounded-lg">
        <Shield className="w-4 h-4 text-green-500" />
        <span className="text-xs text-muted-foreground">
          Secured by 256-bit SSL encryption
        </span>
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      </div>

      {/* Pay Button */}
      <Button
        type="submit"
        disabled={!isFormValid() || isProcessing}
        className="w-full bg-primary text-primary-foreground font-medium glow h-12 text-lg"
      >
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
          />
        ) : (
          `Pay ₹${totalAmount}`
        )}
      </Button>
    </form>
  );
};

export default PaymentForm;
