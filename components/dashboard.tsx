"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';
import { toast } from "sonner";
import { 
  Car, 
  ParkingCircle, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Users,
  Clock
} from "lucide-react";

type SlotStatus = 'available' | 'occupied' | 'maintenance';
type VehicleType = 'car' | 'bike' | 'ev' | 'handicap';

interface Slot {
  id: string;
  slot_number: string;
  slot_type: VehicleType;
  status: SlotStatus;
  floor?: string;
  section?: string;
}

interface OverstayingVehicle {
    id: string;
    entry_time: string;
    vehicles: {
        number_plate: string;
        vehicle_type: string;
    };
    parking_slots: {
        slot_number: string;
    };
}

interface Stats {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  maintenanceSlots: number;
  totalRevenue: number;
  slots: Slot[];
  occupiedSlotsData?: any[];
}

const Dashboard = () => {
  const [data, setData] = React.useState<Stats | null>(null);
  const [overstaying, setOverstaying] = React.useState<OverstayingVehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [exitNumberPlate, setExitNumberPlate] = React.useState<string>("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, overstayRes] = await Promise.all([
        fetch(`/api/dashboard`),
        fetch(`/api/overstay`)
      ]);
      const dashboardData = await dashboardRes.json();
      const overstayData = await overstayRes.json();
      
      setData(dashboardData);
      if (overstayData.overstayingVehicles) {
        setOverstaying(overstayData.overstayingVehicles);
      }

    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleVehicleExit = async () => {
    if(!exitNumberPlate.trim()) {
      toast.error('Number plate is required');
      return;
    }

    try {
      const response = await fetch("/api/parkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberPlate: exitNumberPlate.toUpperCase(),
        }),
      });

      const result = await response.json();

      if(response.ok) {
        toast.success(
          `${exitNumberPlate} checked out. Duration: ${result.billing.duration_hours}h, ₹${result.billing.amount}`
        );
        setExitNumberPlate("");
        fetchDashboardData(); 
      } else {
        toast.error(result.error || 'Checkout failed');
      }
    } catch(error) {
      toast.error('Network error during checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const occupancyRate = data?.totalSlots ? Math.round((data.occupiedSlots / data.totalSlots) * 100) : 0;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Real-time parking management overview
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Slots</p>
                  <p className="text-3xl font-bold text-foreground">{data?.totalSlots || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ParkingCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">100% capacity</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available</p>
                  <p className="text-3xl font-bold text-emerald-600">{data?.availableSlots || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Car className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">
                  {Math.round(((data?.availableSlots || 0) / (data?.totalSlots || 1)) * 100)}% available
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                  <p className="text-3xl font-bold text-red-600">{data?.occupiedSlots || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">{occupancyRate}% occupancy</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                  <p className="text-3xl font-bold text-amber-600">{data?.maintenanceSlots || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-amber-600 font-medium">Under service</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Parking Availability
              </CardTitle>
              <p className="text-sm text-muted-foreground">Real-time slot availability gauge</p>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Gauge
                value={data?.availableSlots || 0}
                valueMax={data?.totalSlots || 100}
                startAngle={-110}
                endAngle={110}
                sx={{
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 32,
                    transform: 'translate(0px, 0px)',
                    fill: 'hsl(var(--primary))',
                    fontWeight: 'bold',
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: 'url(#primaryGradient)',
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: 'hsl(var(--muted))',
                  },
                }}
                text={({ value, valueMax }) => `${value} / ${valueMax}`}
                width={280}
                height={200}
              >
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </Gauge>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <ParkingCircle className="h-5 w-5 text-primary" />
                Parking Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">Current slot status breakdown</p>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <PieChart
                series={[
                  {
                    data: [
                      { 
                        id: 0, 
                        value: data?.availableSlots || 0, 
                        label: 'Available', 
                        color: 'hsl(142 76% 36%)' 
                      },
                      { 
                        id: 1, 
                        value: data?.occupiedSlots || 0, 
                        label: 'Occupied', 
                        color: 'hsl(0 84% 60%)' 
                      },
                      { 
                        id: 2, 
                        value: data?.maintenanceSlots || 0, 
                        label: 'Maintenance', 
                        color: 'hsl(38 92% 50%)' 
                      },
                    ],
                  },
                ]}
                width={280}
                height={200}
              />
            </CardContent>
          </Card>
        </div>

        {overstaying.length > 0 && (
          <Card className="card-hover border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-red-600">
                <Clock className="h-5 w-5" />
                Overstaying Vehicles
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Vehicles parked for more than 6 hours.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overstaying.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-mono font-bold text-red-800">{vehicle.vehicles.number_plate}</p>
                      <p className="text-sm text-muted-foreground">
                        Slot {vehicle.parking_slots.slot_number} - Parked since {new Date(vehicle.entry_time).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">Notify</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 card-hover border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Revenue Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground">Total earnings from completed sessions</p>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold text-green-600 tracking-tight">
                    ₹{data?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>From {data?.occupiedSlotsData?.length || 0} completed sessions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Quick Exit</CardTitle>
              <p className="text-sm text-muted-foreground">Process vehicle checkout</p>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="space-y-2">
                <label htmlFor="quickExit" className="text-sm font-medium">
                  License Plate
                </label>
                <Input
                  id="quickExit"
                  type="text"
                  placeholder="Enter plate number"
                  value={exitNumberPlate}
                  onChange={(e) => setExitNumberPlate(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>
              <Button 
                onClick={handleVehicleExit}
                className="w-full"
                disabled={!exitNumberPlate.trim()}
              >
                Process Exit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
