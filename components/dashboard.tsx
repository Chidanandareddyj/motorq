"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';
import { toast } from "sonner";

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
  const [loading, setLoading] = React.useState(true);
  const [exitNumberPlate, setExitNumberPlate] = React.useState<string>("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard`);
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
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
          `${exitNumberPlate} checked out. Duration: ${result.billing.duration_hours}h, $${result.billing.amount}`
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Parking Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Parking Availability</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Gauge
              value={data?.availableSlots || 0}
              valueMax={data?.totalSlots || 100}
              startAngle={-110}
              endAngle={110}
              sx={{
                [`& .${gaugeClasses.valueText}`]: {
                  fontSize: 40,
                  transform: 'translate(0px, 0px)',
                  fill: '#1e40af',
                  fontWeight: 'bold',
                },
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: 'url(#glossyBlueGradient)',
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                  fill: '#e5e7eb',
                },
              }}
              text={({ value, valueMax }) => `${value} / ${valueMax}`}
              width={300}
              height={200}
            >
              <defs>
                <linearGradient id="glossyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="50%" stopColor="#1d4ed8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity={1} />
                </linearGradient>
              </defs>
            </Gauge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Parking Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: data?.availableSlots || 0, label: 'Available', color: '#00ff88' },
                    { id: 1, value: data?.occupiedSlots || 0, label: 'Occupied', color: '#ff3366' },
                    { id: 2, value: data?.maintenanceSlots || 0, label: 'Maintenance', color: '#ff9500' },
                  ],
                },
              ]}
              width={200}
              height={200}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className="transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-center text-black font-bold flex items-center justify-center gap-2">
             
              Total Revenue Generated
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pt-2">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray mb-3 tracking-tight">
                ₹{data?.totalRevenue?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray bg-gray px-3 py-1">
                From completed parking sessions
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  </div>
  );
};

export default Dashboard;
