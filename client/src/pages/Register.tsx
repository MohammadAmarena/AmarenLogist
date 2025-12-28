import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Truck, Loader2, User, Car } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<"client" | "driver">("client");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    // Driver-specific
    licenseNumber: "",
    vehicleType: "",
    experienceYears: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Registrierung erfolgreich! Sie können sich jetzt anmelden.");
      setLocation("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Registrierung fehlgeschlagen");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setIsLoading(true);
    
    registerMutation.mutate({
      username: formData.username,
      password: formData.password,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      role,
      ...(role === "driver" && {
        licenseNumber: formData.licenseNumber || undefined,
        vehicleType: formData.vehicleType || undefined,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
      }),
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Truck className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Registrierung</CardTitle>
          <CardDescription className="text-base">
            Erstellen Sie Ihr AmarenLogist-Konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Ich bin...</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={role === "client" ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setRole("client")}
                >
                  <User className="w-6 h-6" />
                  <span>Auftraggeber</span>
                </Button>
                <Button
                  type="button"
                  variant={role === "driver" ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setRole("driver")}
                >
                  <Car className="w-6 h-6" />
                  <span>Fahrer</span>
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Benutzername"
                  value={formData.username}
                  onChange={(e) => updateFormData("username", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Vollständiger Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@beispiel.de"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+49 123 456789"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                type="text"
                placeholder="Straße, PLZ, Stadt"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 6 Zeichen"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Driver-specific fields */}
            {role === "driver" && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Fahrerinformationen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Führerscheinnummer</Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="Führerscheinnummer"
                      value={formData.licenseNumber}
                      onChange={(e) => updateFormData("licenseNumber", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Erfahrung (Jahre)</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      placeholder="Jahre"
                      value={formData.experienceYears}
                      onChange={(e) => updateFormData("experienceYears", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Fahrzeugtyp</Label>
                  <Input
                    id="vehicleType"
                    type="text"
                    placeholder="z.B. Transporter, LKW, PKW"
                    value={formData.vehicleType}
                    onChange={(e) => updateFormData("vehicleType", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrierung läuft...
                </>
              ) : (
                "Registrieren"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Bereits registriert?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => setLocation("/login")}
              >
                Jetzt anmelden
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
