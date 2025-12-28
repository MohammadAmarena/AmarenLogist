import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  invoiceStatus: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  recipientType: "client" | "driver";
  pdfUrl?: string;
}

export default function InvoicesDashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      invoiceNumber: "INV-C-1704067200000-123",
      invoiceDate: "2024-01-01",
      dueDate: "2024-01-31",
      totalAmount: "1190.00",
      invoiceStatus: "paid",
      recipientType: "client",
      pdfUrl: "#",
    },
    {
      id: 2,
      invoiceNumber: "INV-D-1704067200000-456",
      invoiceDate: "2024-01-01",
      dueDate: "2024-01-06",
      totalAmount: "750.00",
      invoiceStatus: "paid",
      recipientType: "driver",
      pdfUrl: "#",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.totalAmount.includes(searchTerm);

      const matchesStatus = statusFilter === "all" || invoice.invoiceStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        case "date-asc":
          return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
        case "amount-desc":
          return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
        case "amount-asc":
          return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [invoices, searchTerm, statusFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      draft: { label: "Entwurf", variant: "secondary", icon: Clock },
      sent: { label: "Versendet", variant: "outline", icon: Clock },
      viewed: { label: "Angesehen", variant: "outline", icon: Eye },
      paid: { label: "Bezahlt", variant: "default", icon: CheckCircle },
      overdue: { label: "Überfällig", variant: "destructive", icon: AlertCircle },
      cancelled: { label: "Storniert", variant: "secondary", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.invoiceStatus === "paid").length,
    pending: invoices.filter((i) => ["sent", "viewed", "draft"].includes(i.invoiceStatus)).length,
    overdue: invoices.filter((i) => i.invoiceStatus === "overdue").length,
    totalAmount: invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rechnungen</h1>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie Ihre Rechnungen und Zahlungsstatus
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Rechnungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bezahlt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">Abgeschlossen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Zu bezahlen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Überfällig</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Zahlungsrückstand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamtbetrag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Alle Rechnungen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Rechnungsnummer oder Betrag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="sent">Versendet</SelectItem>
                  <SelectItem value="viewed">Angesehen</SelectItem>
                  <SelectItem value="paid">Bezahlt</SelectItem>
                  <SelectItem value="overdue">Überfällig</SelectItem>
                  <SelectItem value="cancelled">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Sortierung</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Neueste zuerst</SelectItem>
                  <SelectItem value="date-asc">Älteste zuerst</SelectItem>
                  <SelectItem value="amount-desc">Höchster Betrag</SelectItem>
                  <SelectItem value="amount-asc">Niedrigster Betrag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rechnungsübersicht</CardTitle>
          <CardDescription>
            {filteredAndSortedInvoices.length} Rechnungen gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Rechnungen gefunden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnummer</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Fällig am</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString("de-DE")}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString("de-DE")}</TableCell>
                      <TableCell className="font-semibold">€{parseFloat(invoice.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.invoiceStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" title="Ansehen">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Herunterladen">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
