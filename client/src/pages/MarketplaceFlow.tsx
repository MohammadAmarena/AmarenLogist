import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, Truck, Star, Clock, Euro, CheckCircle, AlertCircle } from "lucide-react";

const orderSchema = z.object({
  vehicleType: z.string().min(1, "Fahrzeugtyp ist erforderlich"),
  pickupLocation: z.string().min(5, "Abholort muss mindestens 5 Zeichen haben"),
  deliveryLocation: z.string().min(5, "Zielort muss mindestens 5 Zeichen haben"),
  pickupDate: z.string().min(1, "Abholdatum ist erforderlich"),
  totalPrice: z.number().min(1, "Preis muss größer als 0 sein"),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function MarketplaceFlow() {
  const [step, setStep] = useState<"create" | "offers" | "compare">("create");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      vehicleType: "",
      pickupLocation: "",
      deliveryLocation: "",
      pickupDate: "",
      totalPrice: 0,
    },
  });

  const createOrderMutation = trpc.marketplace.createOrder.useMutation({
    onSuccess: (result) => {
      setOrderId(result.orderId);
      setStep("offers");
    },
  });

  const acceptOfferMutation = trpc.marketplace.acceptOffer.useMutation({
    onSuccess: () => {
      // Show success message and redirect
      alert("Auftrag erfolgreich erstellt!");
    },
  });

  const getOfferQuery = trpc.marketplace.getOffers.useQuery(
    { orderId: orderId || 0 },
    { 
      enabled: !!orderId,
      refetchInterval: 5000, // Refetch offers every 5 seconds
    }
  );

  const onSubmit = async (data: OrderFormData) => {
    try {
      await createOrderMutation.mutateAsync({
        ...data,
        pickupDate: new Date(data.pickupDate),
        totalPrice: data.totalPrice,
      });
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handleAcceptOffer = async (offer: any, orderId: number) => {
    try {
      await acceptOfferMutation.mutateAsync({
        offerId: offer.marketplace_offers.id,
        orderId,
      });
    } catch (error) {
      console.error("Error accepting offer:", error);
    }
  };

  const calculateSavings = (offer: any) => {
    const originalPrice = form.getValues("totalPrice");
    const offerPrice = parseFloat(offer.marketplace_offers.quotedPrice);
    return Math.max(0, originalPrice - offerPrice);
  };

  if (step === "create") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Auftrag erstellen
          </h1>
          <p className="text-muted-foreground">
            Erstellen Sie einen neuen Transportauftrag und erhalten Sie Angebote von qualifizierten Fahrern
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Auftragsdetails</CardTitle>
            <CardDescription>
              Bitte füllen Sie alle Felder aus, um einen Auftrag zu erstellen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fahrzeugtyp</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie einen Fahrzeugtyp" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transporter">Transporter (bis 3,5t)</SelectItem>
                          <SelectItem value="kleintransporter">Kleintransporter</SelectItem>
                          <SelectItem value="lkw">LKW (über 3,5t)</SelectItem>
                          <SelectItem value="kranwagen">Kranwagen</SelectItem>
                          <SelectItem value="tieflader">Tieflader</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Wählen Sie den passenden Fahrzeugtyp für Ihren Transport
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Abholort
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Hamburg, Hamburg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Vollständige Adresse mit Stadt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Zielort
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. München, Bayern" {...field} />
                        </FormControl>
                        <FormDescription>
                          Vollständige Adresse mit Stadt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pickupDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Abholdatum
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Wählen Sie das gewünschte Abholdatum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Euro className="h-4 w-4" />
                        Geschätzter Preis (€)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="z.B. 150.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Geben Sie einen ungefähren Preis für den Transport an
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {createOrderMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Fehler beim Erstellen des Auftrags. Bitte versuchen Sie es erneut.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Auftrag wird erstellt...
                    </>
                  ) : (
                    "Auftrag erstellen"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "offers" && getOfferQuery.data) {
    const offers = getOfferQuery.data;
    
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Star className="h-8 w-8" />
            Verfügbare Angebote
          </h1>
          <p className="text-muted-foreground">
            {offers.length} Angebote für Ihren Auftrag verfügbar
          </p>
        </div>

        <div className="grid gap-6">
          {offers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Noch keine Angebote</h3>
                  <p className="text-muted-foreground">
                    Es wurden noch keine Angebote von Fahrern abgegeben. 
                    Das kann einige Zeit dauern. Die Seite aktualisiert sich automatisch.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Kartenansicht</TabsTrigger>
                <TabsTrigger value="list">Listenansicht</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {offers.map((offer: any) => (
                    <Card 
                      key={offer.marketplace_offers.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setStep("compare");
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{offer.users.name}</CardTitle>
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            {offer.marketplace_offers.driverRating || "Neu"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Preis:</span>
                            <span className="text-xl font-bold text-green-600">
                              €{offer.marketplace_offers.quotedPrice}
                            </span>
                          </div>
                          {calculateSavings(offer) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Ersparnis:</span>
                              <span className="text-sm font-medium text-green-600">
                                €{calculateSavings(offer).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <Separator />
                          <Button className="w-full">
                            Angebot prüfen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-2">
                <ScrollArea className="h-[600px]">
                  {offers.map((offer: any) => (
                    <Card 
                      key={offer.marketplace_offers.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setStep("compare");
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold">{offer.users.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Star className="h-3 w-3" />
                                <span>{offer.marketplace_offers.driverRating || "Neu"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              €{offer.marketplace_offers.quotedPrice}
                            </div>
                            {calculateSavings(offer) > 0 && (
                              <div className="text-sm text-green-600">
                                Ersparnis: €{calculateSavings(offer).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setStep("create");
              setOrderId(null);
            }}
          >
            Zurück zur Auftragserstellung
          </Button>
        </div>
      </div>
    );
  }

  if (step === "compare" && selectedOffer) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Angebot bestätigen
          </h1>
          <p className="text-muted-foreground">
            Überprüfen Sie die Auftragsdetails und bestätigen Sie das Angebot
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auftragsdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fahrzeugtyp:</span>
                <span className="font-medium">{form.getValues("vehicleType")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abholort:</span>
                <span className="font-medium">{form.getValues("pickupLocation")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zielort:</span>
                <span className="font-medium">{form.getValues("deliveryLocation")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abholdatum:</span>
                <span className="font-medium">
                  {new Date(form.getValues("pickupDate")).toLocaleDateString("de-DE")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Geschätzter Preis:</span>
                <span className="font-medium">€{form.getValues("totalPrice").toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fahrerdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fahrer:</span>
                <span className="font-medium">{selectedOffer.users.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{selectedOffer.marketplace_offers.driverRating || "Neu"}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Angebotspreis:</span>
                <span className="text-xl font-bold text-green-600">
                  €{selectedOffer.marketplace_offers.quotedPrice}
                </span>
              </div>
              {calculateSavings(selectedOffer) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ihre Ersparnis:</span>
                  <span className="text-lg font-semibold text-green-600">
                    €{calculateSavings(selectedOffer).toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setStep("offers")}
            >
              Weitere Angebote prüfen
            </Button>
            <Button 
              className="flex-1"
              onClick={() => handleAcceptOffer(selectedOffer, orderId!)}
              disabled={acceptOfferMutation.isPending}
            >
              {acceptOfferMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Auftrag wird bestätigt...
                </>
              ) : (
                "Auftrag bestätigen"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
