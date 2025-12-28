import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Plus, 
  Package, 
  DollarSign, 
  CheckCircle2,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const { data: orders, refetch: refetchOrders } = trpc.orders.getMyOrders.useQuery();
  const { data: myStats } = trpc.statistics.myStats.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  const [formData, setFormData] = useState({
    vehicleType: "",
    vehicleMake: "",
    vehicleModel: "",
    pickupLocation: "",
    deliveryLocation: "",
    pickupDate: "",
    totalPrice: "",
    notes: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "client")) {
      toast.error("Zugriff verweigert");
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Erfolgreich abgemeldet");
        setLocation("/login");
      },
    });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.totalPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Bitte geben Sie einen gültigen Preis ein");
      return;
    }

    createOrderMutation.mutate({
      vehicleType: formData.vehicleType,
      vehicleMake: formData.vehicleMake || undefined,
      vehicleModel: formData.vehicleModel || undefined,
      pickupLocation: formData.pickupLocation,
      deliveryLocation: formData.deliveryLocation,
      pickupDate: new Date(formData.pickupDate),
      totalPrice: price,
      notes: formData.notes || undefined,
    }, {
      onSuccess: () => {
        toast.success("Auftrag erfolgreich erstellt");
        setIsCreateDialogOpen(false);
        setFormData({
          vehicleType: "",
          vehicleMake: "",
          vehicleModel: "",
          pickupLocation: "",
          deliveryLocation: "",
          pickupDate: "",
          totalPrice: "",
          notes: "",
        });
        refetchOrders();
      },
      onError: (error) => {
        toast.error(error.message || "Fehler beim Erstellen des Auftrags");
      },
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBreakdown = (totalPrice: number) => {
    const insurance = totalPrice * 0.15;
    const commission = 100; // Default commission
    const driverPayout = totalPrice - insurance - commission;
    return { insurance, commission, driverPayout };
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AmarenLogist</h1>
              <p className="text-xs text-muted-foreground">Auftraggeber Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-sm font-medium">{user.name}</p>
              <Badge variant="secondary" className="text-xs">Auftraggeber</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aufträge gesamt</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myStats?.totalOrders || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myStats?.completedOrders || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausgaben gesamt</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{myStats?.totalSpent?.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Order Button */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Neuen Auftrag erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuen Auftrag erstellen</DialogTitle>
                <DialogDescription>
                  Geben Sie die Details für Ihre Fahrzeugüberführung ein
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Fahrzeugtyp *</Label>
                    <Input
                      id="vehicleType"
                      placeholder="z.B. PKW, LKW, Motorrad"
                      value={formData.vehicleType}
                      onChange={(e) => updateFormData("vehicleType", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Marke</Label>
                    <Input
                      id="vehicleMake"
                      placeholder="z.B. Mercedes, BMW"
                      value={formData.vehicleMake}
                      onChange={(e) => updateFormData("vehicleMake", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Modell</Label>
                  <Input
                    id="vehicleModel"
                    placeholder="z.B. E-Klasse, 3er"
                    value={formData.vehicleModel}
                    onChange={(e) => updateFormData("vehicleModel", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Abholort *</Label>
                  <Input
                    id="pickupLocation"
                    placeholder="Straße, PLZ, Stadt"
                    value={formData.pickupLocation}
                    onChange={(e) => updateFormData("pickupLocation", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryLocation">Zielort *</Label>
                  <Input
                    id="deliveryLocation"
                    placeholder="Straße, PLZ, Stadt"
                    value={formData.deliveryLocation}
                    onChange={(e) => updateFormData("deliveryLocation", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Abholdatum *</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => updateFormData("pickupDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalPrice">Gesamtpreis (€) *</Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalPrice}
                      onChange={(e) => updateFormData("totalPrice", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {formData.totalPrice && parseFloat(formData.totalPrice) > 0 && (
                  <Card className="bg-muted">
                    <CardHeader>
                      <CardTitle className="text-sm">Preisaufschlüsselung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {(() => {
                        const breakdown = calculateBreakdown(parseFloat(formData.totalPrice));
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Gesamtpreis:</span>
                              <span className="font-medium">€{parseFloat(formData.totalPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>- Versicherung (15%):</span>
                              <span>€{breakdown.insurance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>- Systemprovision:</span>
                              <span>€{breakdown.commission.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span>Fahrer erhält:</span>
                              <span className="font-medium">€{breakdown.driverPayout.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notizen</Label>
                  <Textarea
                    id="notes"
                    placeholder="Zusätzliche Informationen..."
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending ? "Wird erstellt..." : "Auftrag erstellen"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Meine Aufträge</CardTitle>
            <CardDescription>Übersicht Ihrer Fahrzeugüberführungen</CardDescription>
          </CardHeader>
          <CardContent>
            {!orders || orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Noch keine Aufträge vorhanden</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Erstellen Sie Ihren ersten Auftrag
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">#{order.id} - {order.vehicleType}</p>
                        {order.vehicleMake && (
                          <p className="text-sm text-muted-foreground">
                            {order.vehicleMake} {order.vehicleModel}
                          </p>
                        )}
                      </div>
                      <Badge variant={
                        order.status === "abgeschlossen" ? "default" :
                        order.status === "unterwegs" ? "secondary" :
                        order.status === "bestätigt" ? "outline" : "secondary"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Von:</strong> {order.pickupLocation}</p>
                      <p><strong>Nach:</strong> {order.deliveryLocation}</p>
                      <p><strong>Abholdatum:</strong> {new Date(order.pickupDate).toLocaleDateString("de-DE")}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Gesamtpreis</span>
                      <span className="font-bold text-lg">€{parseFloat(order.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
