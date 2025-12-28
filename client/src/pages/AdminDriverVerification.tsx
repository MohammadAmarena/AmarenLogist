import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Eye,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  AlertTriangle
} from "lucide-react";

interface VerificationService {
  id: number;
  userId: number;
  companyName: string;
  taxNumber: string;
  verificationStatus: string;
  isActive: boolean;
  createdAt: string;
  contactPhone?: string;
  contactEmail?: string;
  businessAddress?: string;
  vehicleTypes?: string[];
  additionalInfo?: string;
}

export default function AdminDriverVerification() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedService, setSelectedService] = useState<VerificationService | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  const pendingQuery = trpc.driverNetwork.getPending.useQuery();
  const verifyMutation = trpc.driverNetwork.verify.useMutation();

  const handleVerify = async (serviceId: number, action: 'approve' | 'reject') => {
    try {
      await verifyMutation.mutate({ serviceId });
      if (action === 'approve') {
        alert("Fahrdienst erfolgreich freigegeben!");
      } else {
        alert("Fahrdienst-Antrag abgelehnt.");
      }
    } catch (error) {
      console.error("Error verifying service:", error);
      alert("Fehler bei der Verifizierung. Bitte versuchen Sie es erneut.");
    }
  };

  // Mock additional services data for demonstration
  const allServices: VerificationService[] = [
    {
      id: 1,
      userId: 101,
      companyName: "Muster Transport GmbH",
      taxNumber: "DE1234567890",
      verificationStatus: "unverified",
      isActive: false,
      createdAt: "2024-01-15",
      contactPhone: "+49 123 456789",
      contactEmail: "kontakt@mustetransport.de",
      businessAddress: "Musterstraße 123, 12345 Musterstadt",
      vehicleTypes: ["transporter", "lkw"],
      additionalInfo: "Spezialisiert auf Möbeltransporte"
    },
    {
      id: 2,
      userId: 102,
      companyName: "SchnellLogistik AG",
      taxNumber: "DE9876543210",
      verificationStatus: "verified",
      isActive: true,
      createdAt: "2024-01-10",
      contactPhone: "+49 987 654321",
      contactEmail: "info@schnelllogistik.de",
      businessAddress: "Schnellweg 456, 54321 Schnellstadt",
      vehicleTypes: ["transporter", "kleintransporter", "kranwagen"],
      additionalInfo: "Expresslieferungen binnen 24h"
    },
    {
      id: 3,
      userId: 103,
      companyName: "HeavyLoad Spezialtransporte",
      taxNumber: "DE5556667778",
      verificationStatus: "unverified",
      isActive: false,
      createdAt: "2024-01-20",
      contactPhone: "+49 555 123456",
      contactEmail: "office@heavyload.de",
      businessAddress: "Industriestraße 789, 67890 Industrietown",
      vehicleTypes: ["tieflader", "lkw", "mobiler_kran"],
      additionalInfo: "Spezialisiert auf Schwertransporte über 40t"
    }
  ];

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.taxNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || service.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = allServices.filter(s => s.verificationStatus === "unverified").length;
  const verifiedCount = allServices.filter(s => s.verificationStatus === "verified").length;

  if (pendingQuery.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Fahrdienst-Verifizierung
        </h1>
        <p className="text-muted-foreground">
          Verwalten und verifizieren Sie Fahrdienst-Anträge
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Anträge zur Prüfung
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freigegeben</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              Aktive Fahrdienste
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allServices.length}</div>
            <p className="text-xs text-muted-foreground">
              Alle Anträge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diese Woche</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Neue Anträge
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Firmenname oder Steuernummer suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="unverified">Ausstehend</SelectItem>
                  <SelectItem value="verified">Freigegeben</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service List */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Ausstehend ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Freigegeben ({verifiedCount})
          </TabsTrigger>
          <TabsTrigger value="all">
            Alle ({allServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredServices.filter(s => s.verificationStatus === "unverified").length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine ausstehenden Anträge</h3>
                  <p className="text-muted-foreground">
                    Alle Anträge wurden bearbeitet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredServices
                .filter(s => s.verificationStatus === "unverified")
                .map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {service.companyName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Antrag vom {new Date(service.createdAt).toLocaleDateString("de-DE")}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Ausstehend
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Steuernummer</Label>
                          <div className="font-mono text-sm">{service.taxNumber}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Telefon</Label>
                          <div className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {service.contactPhone}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">E-Mail</Label>
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {service.contactEmail}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fahrzeugtypen</Label>
                          <div className="text-sm">
                            {service.vehicleTypes?.length || 0} Typen
                          </div>
                        </div>
                      </div>

                      {service.additionalInfo && (
                        <div className="mb-4">
                          <Label className="text-xs text-muted-foreground">Zusätzliche Informationen</Label>
                          <p className="text-sm mt-1">{service.additionalInfo}</p>
                        </div>
                      )}

                      <Separator className="my-4" />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedService(service)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details anzeigen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {service.companyName}
                              </DialogTitle>
                              <DialogDescription>
                                Vollständige Antragsdetails
                              </DialogDescription>
                            </DialogHeader>
                            {selectedService && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Firmenname</Label>
                                    <p className="text-sm">{selectedService.companyName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Steuernummer</Label>
                                    <p className="text-sm font-mono">{selectedService.taxNumber}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Telefon</Label>
                                    <p className="text-sm flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {selectedService.contactPhone}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">E-Mail</Label>
                                    <p className="text-sm flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {selectedService.contactEmail}
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Geschäftsadresse</Label>
                                  <p className="text-sm flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {selectedService.businessAddress}
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Fahrzeugtypen</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedService.vehicleTypes?.map((type) => (
                                      <Badge key={type} variant="secondary">
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {selectedService.additionalInfo && (
                                  <div>
                                    <Label className="text-sm font-medium">Zusätzliche Informationen</Label>
                                    <p className="text-sm mt-1">{selectedService.additionalInfo}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          onClick={() => handleVerify(service.id, 'approve')}
                          disabled={verifyMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Freigeben
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleVerify(service.id, 'reject')}
                          disabled={verifyMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Ablehnen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          <div className="grid gap-4">
            {filteredServices
              .filter(s => s.verificationStatus === "verified")
              .map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {service.companyName}
                        </CardTitle>
                        <CardDescription>
                          Freigegeben am {new Date(service.createdAt).toLocaleDateString("de-DE")}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktiv
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Steuernummer</Label>
                        <div className="font-mono text-sm">{service.taxNumber}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Kontakt</Label>
                        <div className="text-sm">{service.contactEmail}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Fahrzeugtypen</Label>
                        <div className="text-sm">{service.vehicleTypes?.length || 0} verfügbar</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {service.companyName}
                      </CardTitle>
                      <CardDescription>
                        Antrag vom {new Date(service.createdAt).toLocaleDateString("de-DE")}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={service.verificationStatus === "verified" ? "default" : "outline"}
                      className={
                        service.verificationStatus === "verified" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "text-orange-600 border-orange-200"
                      }
                    >
                      {service.verificationStatus === "verified" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Freigegeben
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Ausstehend
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Steuernummer</Label>
                      <div className="font-mono text-sm">{service.taxNumber}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Telefon</Label>
                      <div className="text-sm">{service.contactPhone}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">E-Mail</Label>
                      <div className="text-sm">{service.contactEmail}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="text-sm">
                        {service.verificationStatus === "verified" ? "Aktiv" : "Wartend"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
