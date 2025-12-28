import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function DriverNetworkAdmin() {
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Check if user is admin
  if (user?.role !== "super_admin" && user?.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Zugriff verweigert</h1>
        <p className="text-gray-600">
          Sie haben keine Berechtigung, diese Seite zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fahrdienst-Netzwerk Verwaltung</h1>
        <p className="text-gray-600">
          Verwalten und verifizieren Sie Fahrdienst-Anbieter
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <NetworkStatsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PendingVerificationsSection
          selectedServiceId={selectedServiceId}
          onSelectService={setSelectedServiceId}
          onRejectReasonChange={setRejectReason}
          rejectReason={rejectReason}
        />
        <ActiveServicesSection />
      </div>
    </div>
  );
}

function NetworkStatsCard() {
  return (
    <>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Aktive Fahrdienste</p>
        <p className="text-3xl font-bold">12</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Abgeschlossene Aufträge</p>
        <p className="text-3xl font-bold">287</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Durchschnittliche Bewertung</p>
        <p className="text-3xl font-bold">4.8 ⭐</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Gesamtumsatz</p>
        <p className="text-3xl font-bold">€0.00</p>
      </Card>
    </>
  );
}

function PendingVerificationsSection({
  selectedServiceId,
  onSelectService,
  onRejectReasonChange,
  rejectReason,
}: {
  selectedServiceId: number | null;
  onSelectService: (id: number) => void;
  onRejectReasonChange: (reason: string) => void;
  rejectReason: string;
}) {
  // Mock data - in production würde dies von der API kommen
  const pendingServices = [
    {
      id: 1,
      companyName: "Premium Fahrdienste GmbH",
      taxNumber: "DE123456789",
      userName: "Max Mustermann",
      userEmail: "max@example.com",
      userPhone: "+49 123 456789",
      createdAt: new Date(),
    },
    {
      id: 2,
      companyName: "Schnelle Lieferungen AG",
      taxNumber: "DE987654321",
      userName: "Anna Schmidt",
      userEmail: "anna@example.com",
      userPhone: "+49 987 654321",
      createdAt: new Date(),
    },
  ];

  // Mutations würden hier integriert werden
  const handleVerify = () => {
    alert("Fahrdienst verifiziert!");
    onSelectService(0);
  };

  const handleReject = () => {
    alert(`Fahrdienst abgelehnt: ${rejectReason || "Keine Begründung"}`);
    onSelectService(0);
    onRejectReasonChange("");
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ausstehende Verifizierungen</h2>

      {pendingServices.length > 0 ? (
        <div className="space-y-4">
          {pendingServices.map((service) => (
            <div
              key={service.id}
              className={`p-4 border rounded-lg cursor-pointer transition ${
                selectedServiceId === service.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onSelectService(service.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{service.companyName}</h3>
                  <p className="text-sm text-gray-600">{service.userName}</p>
                </div>
                <Badge variant="outline">Ausstehend</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Steuernummer</p>
                  <p className="font-mono">{service.taxNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">E-Mail</p>
                  <p>{service.userEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600">Telefon</p>
                  <p>{service.userPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Eingereicht am</p>
                  <p>
                    {format(service.createdAt, "dd. MMM yyyy", { locale: de })}
                  </p>
                </div>
              </div>

              {selectedServiceId === service.id && (
                <div className="space-y-3 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ablehnung Grund (optional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => onRejectReasonChange(e.target.value)}
                      placeholder="Grund für Ablehnung eingeben..."
                      className="w-full p-2 border rounded text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerify}
                      className="flex-1"
                    >
                      ✓ Verifizieren
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="flex-1"
                    >
                      ✗ Ablehnen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">
          Keine ausstehenden Verifizierungen
        </p>
      )}
    </Card>
  );
}

function ActiveServicesSection() {
  // Mock data - in production würde dies von der API kommen
  const activeServices = [
    {
      id: 1,
      companyName: "Elite Transporte",
      rating: "4.9",
      completedOrders: 156,
      userName: "John Doe",
    },
    {
      id: 2,
      companyName: "Schnell & Sicher",
      rating: "4.7",
      completedOrders: 89,
      userName: "Jane Smith",
    },
    {
      id: 3,
      companyName: "Zuverlässige Lieferungen",
      rating: "4.5",
      completedOrders: 42,
      userName: "Bob Johnson",
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Aktive Fahrdienste</h2>

      {activeServices.length > 0 ? (
        <div className="space-y-3">
          {activeServices.map((service) => (
            <div
              key={service.id}
              className="p-4 border border-green-200 bg-green-50 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{service.companyName}</h3>
                  <p className="text-sm text-gray-600">{service.userName}</p>
                </div>
                <Badge className="bg-green-600">Aktiv</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Bewertung</p>
                  <p className="font-semibold">⭐ {service.rating}/5</p>
                </div>
                <div>
                  <p className="text-gray-600">Abgeschlossene Aufträge</p>
                  <p className="font-semibold">{service.completedOrders}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">
          Keine aktiven Fahrdienste
        </p>
      )}
    </Card>
  );
}
