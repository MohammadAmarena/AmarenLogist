import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Truck, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Erfolgreich angemeldet");
      // Redirect based on role
      if (data.user.role === "super_admin" || data.user.role === "admin") {
        setLocation("/dashboard/admin");
      } else if (data.user.role === "client") {
        setLocation("/dashboard/client");
      } else if (data.user.role === "driver") {
        setLocation("/dashboard/driver");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Anmeldung fehlgeschlagen");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Truck className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">AmarenLogist</CardTitle>
          <CardDescription className="text-base">
            Fahrzeugüberführungs- & Logistikplattform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                type="text"
                placeholder="Benutzername eingeben"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => setLocation("/register")}
              >
                Jetzt registrieren
              </Button>
            </p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo-Zugänge:</strong><br />
              Super Admin: amarenlogist / amarenlogist555<br />
              Admin: zetologist / zetologist123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
