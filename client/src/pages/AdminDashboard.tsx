import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Users, 
  DollarSign, 
  TrendingUp, 
  LogOut,
  Settings,
  FileText,
  Package
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const { data: stats, isLoading: statsLoading } = trpc.statistics.overview.useQuery();
  const { data: orders } = trpc.orders.getAll.useQuery();
  const { data: users } = trpc.users.getAll.useQuery();
  const { data: logs } = trpc.logs.getRecent.useQuery({ limit: 50 });

  useEffect(() => {
    if (!loading && (!user || (user.role !== "super_admin" && user.role !== "admin"))) {
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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isSuperAdmin = user.role === "super_admin";

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
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-sm font-medium">{user.name}</p>
              <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-xs">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </Badge>
            </div>
            {isSuperAdmin && (
              <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard/admin/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : `€${parseFloat(stats?.orders?.totalRevenue || "0").toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Alle abgeschlossenen Aufträge
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aufträge</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.orders?.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Gesamt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.userCounts?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.userCounts?.clients || 0} Clients, {stats?.userCounts?.drivers || 0} Fahrer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provision</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : `€${parseFloat(stats?.orders?.totalCommission || "0").toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Systemprovision
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Aufträge</TabsTrigger>
            <TabsTrigger value="users">Benutzer</TabsTrigger>
            <TabsTrigger value="logs">Aktivitätsprotokoll</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alle Aufträge</CardTitle>
                <CardDescription>
                  Übersicht aller Fahrzeugüberführungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!orders || orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Keine Aufträge vorhanden</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 10).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">#{order.id} - {order.vehicleType}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.pickupLocation} → {order.deliveryLocation}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={
                            order.status === "abgeschlossen" ? "default" :
                            order.status === "unterwegs" ? "secondary" :
                            order.status === "bestätigt" ? "outline" : "secondary"
                          }>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium">€{parseFloat(order.totalPrice).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Benutzer</CardTitle>
                <CardDescription>
                  Alle registrierten Benutzer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!users || users.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Keine Benutzer vorhanden</p>
                ) : (
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            u.role === "super_admin" ? "default" :
                            u.role === "admin" ? "secondary" :
                            u.role === "driver" ? "outline" : "secondary"
                          }>
                            {u.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aktivitätsprotokoll</CardTitle>
                <CardDescription>
                  Letzte Systemaktivitäten
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!logs || logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Keine Aktivitäten vorhanden</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 border rounded text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-muted-foreground">{log.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.createdAt).toLocaleString("de-DE")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
