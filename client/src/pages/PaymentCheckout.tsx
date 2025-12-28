import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function PaymentCheckout() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      alert(`Fehler: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const handlePayment = async () => {
    if (!orderId || !user) return;

    setIsProcessing(true);

    // In production, get the actual order amount from the API
    const totalAmount = 1000; // Example: €10.00

    createCheckoutMutation.mutate({
      orderId: parseInt(orderId),
      totalAmount,
      successUrl: `${window.location.origin}/payment-success?orderId=${orderId}`,
      cancelUrl: `${window.location.origin}/payment-cancel?orderId=${orderId}`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Zahlung für Auftrag</h1>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="text-gray-600">Auftrag ID:</span>
            <span className="font-semibold">#{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Betrag:</span>
            <span className="font-semibold text-lg">€10.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Versicherung (15%):</span>
            <span className="font-semibold">€1.50</span>
          </div>
          <div className="border-t pt-4 flex justify-between">
            <span className="text-gray-600 font-semibold">Gesamtbetrag:</span>
            <span className="font-bold text-xl">€10.00</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing || createCheckoutMutation.isPending}
          className="w-full py-6 text-lg"
        >
          {isProcessing || createCheckoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird verarbeitet...
            </>
          ) : (
            "Mit Stripe bezahlen"
          )}
        </Button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Sie werden zu Stripe weitergeleitet, um die Zahlung sicher zu verarbeiten.
        </p>
      </Card>
    </div>
  );
}
