import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Shield, DollarSign, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "super_admin" || user.role === "admin") {
        setLocation("/dashboard/admin");
      } else if (user.role === "client") {
        setLocation("/dashboard/client");
      } else if (user.role === "driver") {
        setLocation("/dashboard/driver");
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">AmarenLogist</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation("/login")}>
              Anmelden
            </Button>
            <Button onClick={() => setLocation("/register")}>
              Registrieren
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Professionelle Fahrzeugüberführungen
            </h1>
            <p className="text-xl text-muted-foreground">
              Die moderne Plattform für sichere und zuverlässige Fahrzeugtransporte. 
              Verbinden Sie Auftraggeber mit erfahrenen Fahrern.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => setLocation("/register")} className="text-lg">
                Jetzt starten
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/login")} className="text-lg">
                Anmelden
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Warum AmarenLogist?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unsere Plattform bietet alles, was Sie für professionelle Fahrzeugüberführungen benötigen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Versichert & Sicher</CardTitle>
                <CardDescription>
                  Alle Transporte sind mit 15% Versicherungsgebühr abgesichert
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Transparente Preise</CardTitle>
                <CardDescription>
                  Automatische Preisberechnung mit klarer Aufschlüsselung aller Gebühren
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Geprüfte Fahrer</CardTitle>
                <CardDescription>
                  Nur erfahrene und zuverlässige Fahrer auf unserer Plattform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Live-Tracking</CardTitle>
                <CardDescription>
                  Verfolgen Sie den Status Ihrer Überführung in Echtzeit
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">So funktioniert's</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* For Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Für Auftraggeber</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Auftrag erstellen</p>
                    <p className="text-sm text-muted-foreground">Fahrzeugdaten und Route eingeben</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Preis erhalten</p>
                    <p className="text-sm text-muted-foreground">Automatische Kalkulation mit Versicherung</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Bezahlen & Verfolgen</p>
                    <p className="text-sm text-muted-foreground">Sichere Zahlung und Live-Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Drivers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Für Fahrer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Aufträge finden</p>
                    <p className="text-sm text-muted-foreground">Verfügbare Transporte in Ihrer Region</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Auftrag annehmen</p>
                    <p className="text-sm text-muted-foreground">Flexible Auswahl nach Ihren Präferenzen</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Verdienen</p>
                    <p className="text-sm text-muted-foreground">Faire Bezahlung nach Abschluss</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bereit loszulegen?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Registrieren Sie sich jetzt und starten Sie Ihre erste Fahrzeugüberführung
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/register")} className="text-lg">
            Kostenlos registrieren
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AmarenLogist. Alle Rechte vorbehalten.</p>
          <p className="mt-2">Professionelle Fahrzeugüberführungs- & Logistikplattform</p>
        </div>
      </footer>
    </div>
  );
}
