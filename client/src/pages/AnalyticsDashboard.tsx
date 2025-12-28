import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Truck, 
  ShoppingCart,
  Calendar,
  MapPin,
  Clock,
  Star,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Mock data for demonstration
const analyticsData = {
  overview: {
    totalRevenue: 125680,
    totalOrders: 1247,
    activeDrivers: 89,
    activeClients: 342,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    driversGrowth: 15.2,
    clientsGrowth: 6.8,
  },
  monthlyData: [
    { month: 'Jan', revenue: 18500, orders: 156, drivers: 65, clients: 245 },
    { month: 'Feb', revenue: 22000, orders: 189, drivers: 72, clients: 278 },
    { month: 'Mär', revenue: 24800, orders: 203, drivers: 78, clients: 298 },
    { month: 'Apr', revenue: 28900, orders: 234, drivers: 82, clients: 312 },
    { month: 'Mai', revenue: 32100, orders: 267, drivers: 85, clients: 328 },
    { month: 'Jun', revenue: 35400, orders: 298, drivers: 89, clients: 342 },
  ],
  vehicleTypes: [
    { type: 'Transporter', count: 45, percentage: 50.6, color: '#3b82f6' },
    { type: 'LKW', count: 23, percentage: 25.8, color: '#ef4444' },
    { type: 'Kranwagen', count: 12, percentage: 13.5, color: '#10b981' },
    { type: 'Tieflader', count: 9, percentage: 10.1, color: '#f59e0b' },
  ],
  topDrivers: [
    { name: 'Max Müller', orders: 89, rating: 4.9, revenue: 15680 },
    { name: 'Hans Schmidt', orders: 76, rating: 4.8, revenue: 14200 },
    { name: 'Thomas Weber', orders: 71, rating: 4.7, revenue: 13890 },
    { name: 'Peter Klein', orders: 68, rating: 4.9, revenue: 13200 },
    { name: 'Wolfgang Groß', orders: 64, rating: 4.6, revenue: 12850 },
  ],
  topClients: [
    { name: 'LogiTech GmbH', orders: 45, spent: 8900 },
    { name: 'TransportPlus AG', orders: 38, spent: 7650 },
    { name: 'FastMove Ltd', orders: 32, spent: 6800 },
    { name: 'SpeedyTrans', orders: 28, spent: 5900 },
    { name: 'CargoExpress', orders: 25, spent: 5200 },
  ],
  orderStatus: [
    { status: 'Abgeschlossen', count: 1023, color: '#10b981' },
    { status: 'In Bearbeitung', count: 156, color: '#3b82f6' },
    { status: 'Ausstehend', count: 68, color: '#f59e0b' },
  ],
  revenueByRegion: [
    { region: 'Berlin', revenue: 32400, percentage: 25.8 },
    { region: 'München', revenue: 28900, percentage: 23.0 },
    { region: 'Hamburg', revenue: 21200, percentage: 16.9 },
    { region: 'Köln', revenue: 18600, percentage: 14.8 },
    { region: 'Frankfurt', revenue: 24580, percentage: 19.5 },
  ],
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const calculateGrowth = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive: growth >= 0,
    };
  };

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    growth?: { value: string; isPositive: boolean };
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {growth && (
          <p className="text-xs text-muted-foreground">
            <span className={`flex items-center gap-1 ${
              growth.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {growth.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {growth.value}% gegenüber letztem Monat
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );

  const BarChart = ({ data, title, color = '#3b82f6' }: { 
    data: any[]; 
    title: string; 
    color?: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-medium truncate">
                {item.month || item.name || item.region}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(item.value || item.count || item.revenue) / Math.max(...data.map(d => d.value || d.count || d.revenue)) * 100}%` 
                  }}
                />
              </div>
              <div className="w-16 text-sm text-right font-medium">
                {item.value ? formatCurrency(item.value) : 
                 item.count ? formatNumber(item.count) : 
                 item.revenue ? formatCurrency(item.revenue) : item}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const PieChart = ({ data, title }: { data: any[]; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.type || item.status}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {item.count || item.revenue ? formatNumber(item.count || item.revenue) : item.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.percentage}% Anteil
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatNumber(data.reduce((sum, item) => sum + (item.count || 0), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Gesamt</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Umfassende Einblicke in Ihr Transportgeschäft
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Letzte 7 Tage</SelectItem>
                <SelectItem value="30days">Letzte 30 Tage</SelectItem>
                <SelectItem value="3months">Letzte 3 Monate</SelectItem>
                <SelectItem value="6months">Letzte 6 Monate</SelectItem>
                <SelectItem value="1year">Letztes Jahr</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Live Updates
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Gesamtumsatz"
          value={formatCurrency(analyticsData.overview.totalRevenue)}
          growth={{
            value: analyticsData.overview.revenueGrowth.toString(),
            isPositive: analyticsData.overview.revenueGrowth >= 0,
          }}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Aufträge gesamt"
          value={formatNumber(analyticsData.overview.totalOrders)}
          growth={{
            value: analyticsData.overview.ordersGrowth.toString(),
            isPositive: analyticsData.overview.ordersGrowth >= 0,
          }}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Aktive Fahrer"
          value={formatNumber(analyticsData.overview.activeDrivers)}
          growth={{
            value: analyticsData.overview.driversGrowth.toString(),
            isPositive: analyticsData.overview.driversGrowth >= 0,
          }}
          icon={Truck}
          color="purple"
        />
        <StatCard
          title="Aktive Kunden"
          value={formatNumber(analyticsData.overview.activeClients)}
          growth={{
            value: analyticsData.overview.clientsGrowth.toString(),
            isPositive: analyticsData.overview.clientsGrowth >= 0,
          }}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="revenue">Umsatz</TabsTrigger>
          <TabsTrigger value="drivers">Fahrer</TabsTrigger>
          <TabsTrigger value="clients">Kunden</TabsTrigger>
          <TabsTrigger value="regions">Regionen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart 
              data={analyticsData.monthlyData} 
              title="Monatliche Entwicklung" 
            />
            <PieChart 
              data={analyticsData.vehicleTypes} 
              title="Fahrzeugtypen-Verteilung" 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auftragsstatus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.orderStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm font-medium">{status.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{formatNumber(status.count)}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((status.count / analyticsData.overview.totalOrders) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schnellzugriff</CardTitle>
                <CardDescription>
                  Häufig verwendete Funktionen und Metriken
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Target className="h-6 w-6 mb-2" />
                    <span className="text-sm">Ziele</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span className="text-sm">Realtime</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Star className="h-6 w-6 mb-2" />
                    <span className="text-sm">Bewertungen</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <MapPin className="h-6 w-6 mb-2" />
                    <span className="text-sm">Routen</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart 
              data={analyticsData.monthlyData.map(d => ({ 
                month: d.month, 
                value: d.revenue 
              }))} 
              title="Monatlicher Umsatz" 
            />
            <Card>
              <CardHeader>
                <CardTitle>Umsatz nach Regionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.revenueByRegion.map((region, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium">{region.region}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                      <div className="w-20 text-sm text-right font-medium">
                        {formatCurrency(region.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Fahrer</CardTitle>
                <CardDescription>
                  Nach Anzahl der Aufträge und Umsatz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topDrivers.map((driver, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {driver.orders} Aufträge • {formatCurrency(driver.revenue)} Umsatz
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{driver.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <PieChart 
              data={analyticsData.vehicleTypes} 
              title="Fahrzeugtypen der aktiven Fahrer" 
            />
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Kunden</CardTitle>
              <CardDescription>
                Nach Anzahl der Aufträge und Ausgaben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.orders} Aufträge
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(client.spent)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Gesamtumsatz
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regionale Umsatzverteilung</CardTitle>
              <CardDescription>
                Umsatz nach Bundesländern und Städten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.revenueByRegion.map((region, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{region.percentage}%</Badge>
                    </div>
                    <div className="font-medium">{region.region}</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(region.revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Monatlicher Durchschnitt
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
