declare module '@paystack/inline-js' {
  interface PaystackOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    callback?: (response: any) => void;
    onClose?: () => void;
    label?: string;
    channels?: string[];
    metadata?: Record<string, any>;
  }

  interface PaystackPop {
    resumeTransaction(accessCode: string): void;
    newTransaction(options: PaystackOptions): void;
  }

  const PaystackPop: {
    setup(options: PaystackOptions): PaystackPop;
  };

  export default PaystackPop;
}
