import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Building2, FileText, Clock, AlertCircle, Upload, Phone, Mail } from "lucide-react";

const driverServiceSchema = z.object({
  companyName: z.string().min(2, "Firmenname muss mindestens 2 Zeichen haben"),
  taxNumber: z.string().regex(/^[A-Z]{2}[0-9]{10}$/, "Steuernummer muss im Format XX1234567890 sein"),
  contactPhone: z.string().min(10, "Telefonnummer ist erforderlich"),
  contactEmail: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  businessAddress: z.string().min(10, "Geschäftsadresse ist erforderlich"),
  vehicleTypes: z.array(z.string()).min(1, "Mindestens ein Fahrzeugtyp muss ausgewählt werden"),
  additionalInfo: z.string().optional(),
});

type DriverServiceFormData = z.infer<typeof driverServiceSchema>;

const vehicleTypes = [
  { value: "transporter", label: "Transporter (bis 3,5t)" },
  { value: "kleintransporter", label: "Kleintransporter" },
  { value: "lkw", label: "LKW (über 3,5t)" },
  { value: "kranwagen", label: "Kranwagen" },
  { value: "tieflader", label: "Tieflader" },
  { value: "autotransporter", label: "Autotransporter" },
  { value: "mobiler_kran", "label": "Mobiler Kran" },
];

export default function DriverServiceSignup() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submittedData, setSubmittedData] = useState<DriverServiceFormData | null>(null);

  const form = useForm<DriverServiceFormData>({
    resolver: zodResolver(driverServiceSchema),
    defaultValues: {
      companyName: "",
      taxNumber: "",
      contactPhone: "",
      contactEmail: "",
      businessAddress: "",
      vehicleTypes: [],
      additionalInfo: "",
    },
  });

  const registerMutation = trpc.driverNetwork.register.useMutation({
    onSuccess: (result) => {
      setSubmittedData(form.getValues());
      setStep("success");
    },
  });

  const onSubmit = async (data: DriverServiceFormData) => {
    try {
      await registerMutation.mutateAsync({
        companyName: data.companyName,
        taxNumber: data.taxNumber,
      });
    } catch (error) {
      console.error("Error registering driver service:", error);
    }
  };

  if (step === "success" && submittedData) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Anmeldung erfolgreich eingereicht!
            </CardTitle>
            <CardDescription className="text-green-700">
              Ihr Fahrdienst-Antrag wurde erfolgreich übermittelt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Übermittelte Daten
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Firmenname:</span>
                  <div className="font-medium">{submittedData.companyName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Steuernummer:</span>
                  <div className="font-medium">{submittedData.taxNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefon:</span>
                  <div className="font-medium">{submittedData.contactPhone}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">E-Mail:</span>
                  <div className="font-medium">{submittedData.contactEmail}</div>
                </div>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Nächste Schritte:</strong><br />
                1. Unser Team prüft Ihre Unterlagen (1-2 Werktage)<br />
                2. Sie erhalten eine E-Mail mit dem Ergebnis<br />
                3. Nach Freigabe können Sie Aufträge annehmen
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setStep("form");
                  form.reset();
                }}
              >
                Weitere Registrierung
              </Button>
              <Button 
                className="flex-1"
                onClick={() => window.location.href = "/"}
              >
                Zurück zur Startseite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Building2 className="h-8 w-8" />
          Fahrdienst registrieren
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Registrieren Sie Ihr Fahrdienst-Unternehmen und werden Sie Teil unseres Netzwerks. 
          Nach der Verifizierung können Sie Aufträge annehmen und Ihr Geschäft ausbauen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Firmendetails</CardTitle>
              <CardDescription>
                Bitte füllen Sie alle Felder vollständig aus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Firmenname *</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Muster Transport GmbH" {...field} />
                          </FormControl>
                          <FormDescription>
                            Offizieller Firmenname laut Handelsregister
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Steuernummer *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="DE1234567890" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormDescription>
                            Format: Ländercode + 10 Ziffern (z.B. DE1234567890)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Telefonnummer *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+49 123 456789" {...field} />
                          </FormControl>
                          <FormDescription>
                            Hauptkontakt für Rückfragen
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            E-Mail-Adresse *
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="kontakt@firma.de" {...field} />
                          </FormControl>
                          <FormDescription>
                            E-Mail für offizielle Kommunikation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geschäftsadresse *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Musterstraße 123, 12345 Musterstadt" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Vollständige Geschäftsadresse mit Straße, PLZ und Ort
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleTypes"
                    render={() => (
                      <FormItem>
                        <FormLabel>Fahrzeugtypen *</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {vehicleTypes.map((vehicle) => (
                            <label
                              key={vehicle.value}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={vehicle.value}
                                onChange={(e) => {
                                  const currentTypes = form.getValues("vehicleTypes");
                                  if (e.target.checked) {
                                    form.setValue("vehicleTypes", [...currentTypes, vehicle.value]);
                                  } else {
                                    form.setValue("vehicleTypes", currentTypes.filter(t => t !== vehicle.value));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{vehicle.label}</span>
                            </label>
                          ))}
                        </div>
                        <FormDescription>
                          Wählen Sie alle Fahrzeugtypen aus, die Sie anbieten können
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zusätzliche Informationen</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Besondere Qualifikationen, Spezialisierungen, verfügbare Zeiten, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Weitere Informationen über Ihr Unternehmen
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {registerMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Fehler bei der Registrierung. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Registrierung wird verarbeitet...
                      </>
                    ) : (
                      "Registrierung einreichen"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Warum sich registrieren?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">Neue Aufträge</div>
                  <div className="text-sm text-muted-foreground">
                    Erhalten Sie Zugang zu unserem Auftrags-Marktplatz
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">Faire Bezahlung</div>
                  <div className="text-sm text-muted-foreground">
                    Transparente Preisgestaltung und pünktliche Auszahlung
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">Professionelle Unterstützung</div>
                  <div className="text-sm text-muted-foreground">
                    24/7 Support und technische Hilfestellung
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verifizierungsprozess</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  1
                </Badge>
                <div className="text-sm">
                  <div className="font-medium">Antrag einreichen</div>
                  <div className="text-muted-foreground">Formular ausfüllen</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  2
                </Badge>
                <div className="text-sm">
                  <div className="font-medium">Dokumente prüfen</div>
                  <div className="text-muted-foreground">1-2 Werktage Bearbeitung</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  3
                </Badge>
                <div className="text-sm">
                  <div className="font-medium">Freigabe erhalten</div>
                  <div className="text-muted-foreground">Aufträge annehmen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Hinweis:</strong> Sie benötigen eine gültige Gewerbeanmeldung 
              und entsprechende Fahrzeugversicherungen für die Verifizierung.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
