import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function MarketplaceOrders() {
  const { user } = useAuth();
  const [step, setStep] = useState<"create" | "browse" | "offers">("browse");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    vehicleType: "",
    pickupLocation: "",
    deliveryLocation: "",
    pickupDate: "",
    totalPrice: "",
  });

  // Queries
  const availableOrdersQuery = trpc.marketplace.getAvailableOrders.useQuery(
    undefined,
    { enabled: user?.role === "driver" }
  );

  const offersQuery = trpc.marketplace.getOffers.useQuery(
    { orderId: selectedOrderId || 0 },
    { enabled: !!selectedOrderId }
  );

  // Mutations
  const createOrderMutation = trpc.marketplace.createOrder.useMutation({
    onSuccess: (data) => {
      alert(`Auftrag erstellt! ID: ${data.orderId}`);
      setStep("browse");
      setFormData({
        vehicleType: "",
        pickupLocation: "",
        deliveryLocation: "",
        pickupDate: "",
        totalPrice: "",
      });
    },
  });

  const submitOfferMutation = trpc.marketplace.submitOffer.useMutation({
    onSuccess: () => {
      alert("Angebot erfolgreich eingereicht!");
      availableOrdersQuery.refetch();
    },
  });

  const acceptOfferMutation = trpc.marketplace.acceptOffer.useMutation({
    onSuccess: () => {
      alert("Angebot akzeptiert!");
      setStep("browse");
      setSelectedOrderId(null);
    },
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrderMutation.mutateAsync({
      vehicleType: formData.vehicleType,
      pickupLocation: formData.pickupLocation,
      deliveryLocation: formData.deliveryLocation,
      pickupDate: new Date(formData.pickupDate),
      totalPrice: parseFloat(formData.totalPrice),
    });
  };

  const handleSubmitOffer = async (orderId: number, quotedPrice: number) => {
    await submitOfferMutation.mutateAsync({
      orderId,
      quotedPrice,
    });
  };

  const handleAcceptOffer = async (offerId: number, orderId: number) => {
    await acceptOfferMutation.mutateAsync({
      offerId,
      orderId,
    });
  };

  // Client View - Create Order
  if (user?.role === "client" && step === "create") {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Neuen Auftrag erstellen</h1>
        <Card className="p-6">
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <Label htmlFor="vehicleType">Fahrzeugtyp</Label>
              <Input
                id="vehicleType"
                placeholder="z.B. BMW 3er, Mercedes C-Klasse"
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pickupLocation">Abholort</Label>
              <Input
                id="pickupLocation"
                placeholder="z.B. Berlin, Hauptstraße 10"
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="deliveryLocation">Zielort</Label>
              <Input
                id="deliveryLocation"
                placeholder="z.B. Munich, Marienplatz 5"
                value={formData.deliveryLocation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryLocation: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="pickupDate">Abholtermin</Label>
              <Input
                id="pickupDate"
                type="date"
                value={formData.pickupDate}
                onChange={(e) =>
                  setFormData({ ...formData, pickupDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="totalPrice">Preis (€)</Label>
              <Input
                id="totalPrice"
                type="number"
                placeholder="z.B. 1000"
                value={formData.totalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, totalPrice: e.target.value })
                }
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createOrderMutation.isPending}>
                {createOrderMutation.isPending ? "Wird erstellt..." : "Auftrag erstellen"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("browse")}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Client View - Browse Offers
  if (user?.role === "client" && step === "offers" && selectedOrderId) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Verfügbare Angebote</h1>

        {offersQuery.isLoading && <p>Lädt Angebote...</p>}

        {offersQuery.data && offersQuery.data.length > 0 ? (
          <div className="space-y-4">
            {offersQuery.data.map((offer) => (
              <Card key={offer.id} className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Fahrer</p>
                    <p className="font-semibold">{offer.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Angebotspreis</p>
                    <p className="font-semibold text-lg">€{parseFloat(offer.quotedPrice).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bewertung</p>
                    <p className="font-semibold">⭐ {offer.driverRating}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Abgeschlossene Aufträge</p>
                    <p className="font-semibold">{offer.completedJobs}</p>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    handleAcceptOffer(offer.id, selectedOrderId)
                  }
                  disabled={acceptOfferMutation.isPending}
                >
                  {acceptOfferMutation.isPending
                    ? "Wird akzeptiert..."
                    : "Angebot akzeptieren"}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Noch keine Angebote eingegangen</p>
        )}

        <Button
          variant="outline"
          onClick={() => {
            setStep("browse");
            setSelectedOrderId(null);
          }}
          className="mt-4"
        >
          Zurück
        </Button>
      </div>
    );
  }

  // Driver View - Browse Available Orders
  if (user?.role === "driver" && step === "browse") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Verfügbare Aufträge</h1>

        {availableOrdersQuery.isLoading && <p>Lädt Aufträge...</p>}

        {availableOrdersQuery.data && availableOrdersQuery.data.length > 0 ? (
          <div className="space-y-4">
            {availableOrdersQuery.data.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Fahrzeugtyp</p>
                    <p className="font-semibold">{order.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preis</p>
                    <p className="font-semibold text-lg">€{parseFloat(order.totalPrice).toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-semibold">
                      {order.pickupLocation} → {order.deliveryLocation}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Abholtermin</p>
                    <p className="font-semibold">
                      {format(new Date(order.pickupDate), "dd. MMMM yyyy", {
                        locale: de,
                      })}
                    </p>
                  </div>
                </div>

                <SubmitOfferForm
                  orderId={order.id}
                  basePrice={parseFloat(order.totalPrice)}
                  onSubmit={(quotedPrice) =>
                    handleSubmitOffer(order.id, quotedPrice)
                  }
                  isLoading={submitOfferMutation.isPending}
                />
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Keine verfügbaren Aufträge</p>
        )}
      </div>
    );
  }

  // Default View
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      {user?.role === "client" && (
        <div className="space-y-4">
          <Button onClick={() => setStep("create")} size="lg">
            Neuen Auftrag erstellen
          </Button>
        </div>
      )}

      {user?.role === "driver" && (
        <p className="text-gray-600">
          Verfügbare Aufträge werden oben angezeigt. Geben Sie ein Angebot ab!
        </p>
      )}
    </div>
  );
}

function SubmitOfferForm({
  orderId,
  basePrice,
  onSubmit,
  isLoading,
}: {
  orderId: number;
  basePrice: number;
  onSubmit: (price: number) => void;
  isLoading: boolean;
}) {
  const [quotedPrice, setQuotedPrice] = useState(basePrice.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(quotedPrice));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor={`price-${orderId}`}>Mein Angebot (€)</Label>
        <Input
          id={`price-${orderId}`}
          type="number"
          value={quotedPrice}
          onChange={(e) => setQuotedPrice(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Wird eingereicht..." : "Angebot einreichen"}
      </Button>
    </form>
  );
}
