import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const orderId = params.get("orderId");

  const handlePaymentSuccessMutation = trpc.stripe.handlePaymentSuccess.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Payment was successful
        setTimeout(() => {
          setLocation("/dashboard/client");
        }, 3000);
      }
    },
  });

  useEffect(() => {
    if (sessionId) {
      handlePaymentSuccessMutation.mutate({ sessionId });
    }
  }, [sessionId]);

  return (
    <div className="max-w-2xl mx-auto p-4 flex items-center justify-center min-h-screen">
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Zahlung erfolgreich!</h1>
        <p className="text-gray-600 mb-6">
          Vielen Dank für Ihre Zahlung. Ihr Auftrag wurde bestätigt.
        </p>

        {orderId && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Auftrag ID:</p>
            <p className="text-xl font-semibold">#{orderId}</p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          Sie werden in Kürze zum Dashboard weitergeleitet...
        </p>

        <Button
          onClick={() => setLocation("/dashboard/client")}
          className="w-full"
        >
          Zum Dashboard
        </Button>
      </Card>
    </div>
  );
}
